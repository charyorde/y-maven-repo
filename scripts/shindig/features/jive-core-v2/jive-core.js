

/********** core/namespace.js **********/

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

osapi.jive.extend(osapi.jive, {

  /*
   * jive.app(name[, mainClass]) -> Function
   * - name (String): new namespace to create under `jive`
   * - mainClass (String): optional, name of the class to use as the main
   *   class of the app
   *
   * Creates a new app namespaced under `jive`.  Instead of just setting
   * the namespace to an empty object as `jive.namespace()` does, this
   * method defines the namespace as a function that invokes a property
   * of itself called `Main`.
   *
   * If `mainClass` is given then the namespace function invokes the
   * class with that name instead of `Main`.
   *
   * The method allows apps to be initialized this way while still
   * allowing for multiple classes to be namespaced under the app:
   *
   *     var myApp = new jive.MyApp(arg1, arg2);
   *
   * instead of this slightly less attractive way:
   *
   *     var myApp = new jive.MyApp.Main(arg1, arg2);
   *
   * And this should work too:
   *
   *     myApp instanceof jive.MyApp //=> true
   *     myApp.constructor === jive.MyApp //=> true
   *
   * The name of the new app may contain dots (.) in which case nested
   * namespaces are conditionally created for each component of the name.
   */
  app: function(name, mainClass) {
    var parts = name.split('.'),
        root = this,
        main = mainClass || 'Main';

    return this.namespace(name, function(/* args */) {
      var parent = parts.slice(0, -1).reduce(function(s,p) { return s[p]; }, root),
          space  = parent[parts.last()],  // The app namespace.
          Main   = space[main],  // Main class of the app.
          instance;

      if (osapi.jive.isFunction(Main)) {
        osapi.jive.extend(Main, space);  // Copy all properties of space onto `Main`.
        Main[main] = Main;  // Copy a reference to `Main` onto itself.
        parent[parts.last()] = Main;  // Replace the app namespace placeholder with `Main`.

        instance = Object.create(Main.prototype);
        Main.apply(instance, arguments);  // Instantiates a new instance of `Main`.
        return instance;
      } else {
        throw("No class called `"+ main +"` was found in jive."+ name +".");
      }
    });
  }

});

// Create stubs for logging functions in case some debugging statements are
// left in.
osapi.jive.namespace.call(window, 'console.log',   function() {});
osapi.jive.namespace.call(window, 'console.debug', function() {});
osapi.jive.namespace.call(window, 'console.error', function() {});
osapi.jive.namespace.call(window, 'console.warn',  function() {});
osapi.jive.namespace.call(window, 'console.info',  function() {});


/********** core/jsonPathLite.js **********/

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
/*
 * osapi.jive.jsonPathLite
 *
 * Simple utility class for drilling down into a json object and grabbing what you want.
 * XPath like, but very basic. Only supports slashes.
 *
 * example
 *   var obj = {
 *     "foo": {
 *       "bar" : "baz"
 *     }
 *   };
 *   
 *   osapi.jive.jsonPathLite(obj, '/foo/bar') == "baz" // true
 *
 */

osapi.jive.jsonPathLite = function(object, path) {
  if(object === null) {
    return null;
  }
  if(path == '/') {
    return object;
  }

  var parts = path.split(/\//); // split on /

  // if a / exists at the beginning of the path, the first item is an empty string, remove it
  if(parts[0] == '') {
    parts.shift();
  }

  // drill down
  var part   = parts.shift();
  var result = object[part];

  if(typeof result == 'undefined') {
    return null;
  }

  // if there are still more parts, recurse, otherwise return result
  if(parts.length > 0) {
    return osapi.jive.jsonPathLite(result, parts.join('/'));
  } else {
    return result;
  }

};


// **** Tests - uncomment to run


// $(document).ready(function() {
// 
//   module("JsonPathLite");
// 
//   test("should get the object located at /foo", function() {
//     var obj = {"foo" : "bar"};
//     equal (osapi.jive.jsonPathLite(obj, '/foo'), "bar");
//   });
//
//   test("should get the object located at /foo/bar", function() {
//     var obj = {
//       "foo": {
//         "bar" : "baz"
//       }
//     };
//
//     equal(osapi.jive.jsonPathLite(obj, '/foo/bar'), "baz");
//   });
//
//   test("should get the object located at /foo/bar/baz", function() {
//     var obj = {
//       "foo": {
//         "bar" : {
//           "baz" : "heyoo"
//         }
//       }
//     };
//
//     equal(osapi.jive.jsonPathLite(obj, '/foo/bar/baz'), "heyoo");
//   });
//
//   test("should return null if no object is located at /foo/bar/baz", function() {
//     var obj1 = {
//       "foo": {
//         "bar" : {
//           "wrong" : "heyoo" // wrong key at level 3
//         }
//       }
//     };
//     var obj2 = { 
//       "foo": {
//         "wrong" : {  // wrong key at level 2
//           "baz" : "heyoo"
//         }
//       }
//     };
//     var obj3 = { 
//       "wrong": {  // wrong key at level 1
//         "bar" : {
//           "baz" : "heyoo"
//         }
//       }
//     };
//     var obj4 = {}; // empty object
//
//     equal(osapi.jive.jsonPathLite(obj1, '/foo/bar/baz'), null);
//     equal(osapi.jive.jsonPathLite(obj2, '/foo/bar/baz'), null);
//     equal(osapi.jive.jsonPathLite(obj3, '/foo/bar/baz'), null);
//     equal(osapi.jive.jsonPathLite(obj4, '/foo/bar/baz'), null);
//   });
// 
// });


/********** core/core.js **********/

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
/**
 * <h2>API Organization</h2>
 * <p>The Jive Core API is organized into three broad categories:</p>
 * <ol>
 * <li>Static classes</li>
 * <li>Classes</li>
 * <li>Extendable</li>
 * </ol>
 * <h3>Static classes</h3>
 * <p>The artifacts that are listed under "static classes" are collections of static functions that are used as entry
 * points into the API. These methods are generally used to obtain instances of the non-static classes; however, there
 * are some operations that can be done directly with the static functions.</p>
 * <p>For example, to get a <a href="osapi.jive.core.User.html">user</a>, the following code can be used:</p>
 * <div class='example'><code class="comment">// get the request that will fetch a user by username</code>
 *   <code>var request = osapi.jive.core.User.get({username: 'admin'});</code>
 *   <code class="comment">// execute the request</code>
 *   <code>request.execute(function(response) {</code>
 *   <code>  if(response.error) {</code>
 *   <code>    var code = response.error.code;</code>
 *   <code>    var message = response.error.message;</code>
 *   <code class="comment">    // present the user with an appropriate error message</code>
 *   <code>  } else {</code>
 *   <code>    var user = response.data;</code>
 *   <code class="comment">    // use the user object as appropriate</code>
 *   <code>  }</code>
 *   <code>}</code>
 * </div>
 * <h3>Classes</h3>
 * <p>The artifacts that are listed under "classes" provide an object oriented view of the Jive system. Instances of
 * these classes are never constructed directly. They are obtained through calls to one of the static class methods.
 * Once an instance is obtained, the properties and methods of that class can be accessed in the standard Javascript
 * fashion.</p>
 * <p>For example, if a user is obtained as described above, that user's blog can be obtained directly from the user
 * object:</p>
 * <div class='example'><code class='comment'>// ensure that blog is accessable</code>
 *   <code>if(user.blog && user.blog.get)</code>
 *   <code class='comment'>  // get the request that will fetch the user's blog</code>
 *   <code>  var request = user.blog.get();</code>
 *   <code class='comment'>  // execute the request</code>
 *   <code>  request.execute(function(response) {</code>
 *   <code>    if(response.error) {</code>
 *   <code>      var code = response.error.code</code>
 *   <code>      var message = response.error.message</code>
 *   <code class='comment'>      // present the user with an appropriate error message</code>
 *   <code>    } else {</code>
 *   <code>      var blog = response.data;</code>
 *   <code class='comment'>      // use the blog object as appropriate</code>
 *   <code>    }</code>
 *   <code>  }</code>
 *   <code>}</code>
 * </div>
 * <h3>Extendable</h3>
 * <p>The artifacts that are listed under "extendable" are not first class elements in the Core API. That is, they can
 * not be instantiated or manipulated directly. Instead they are used to add funcationality to the non-static classes.
 * For example, the <a href="osapi.jive.core.Followable.html">Followable</a> item is used to add methods to classes
 * that allow for following such as a blog <a href="osapi.jive.core.Post.html">post</a>.</p>
 * <p>In general, extendable elements are named with the suffix 'able' if they provide additional methods and 'Holder'
 * if they provide additional properties</p>
 * <h2>Authentication</h2>
 * <p>In order to use the Core API, the user running the app needs to be authenticated with the Jive container. The way
 * that this happens is outside of the scope of this API. It is generally done by logging into Jive via the web UI. Once
 * this is done, the app and all of its Core API calls run with the permissions of that logged in user.</p>
 * @module core-api
 */

osapi.jive.core = osapi.jive.core || {};
osapi.jive.extend(osapi.jive.core, {

  basePath: '/api/core/v2',




  //--------------------------------------------------------------------------------------------------------------------
  // JSON RPC methods
  //--------------------------------------------------------------------------------------------------------------------

  /*
   * Get a collection of Core API JSON objects via JSON RPC.
   *
   * @param options {Object} A javascript object that can override the default options
   * @param options.limit {Number} The number of results to return. Defaults to 10.
   * @param options.offset {Number} The number of items to skip before starting to return items. Defaults to 0.
   * @private
   */
  getCollection: function(options) {
    //console.log('---> getCollection()');

    options = osapi.jive.extend({ limit : 25, offset : 0  }, options || {});
    if(!options.jsonPath) {
      throw new Error('Unable to fetch collection. Please specify "jsonPath" in the call');
    }
    if(!options.findUrl) {
      throw new Error('Unable to fetch collection. Please specify "findUrl" in the call');
    }

    var params = osapi.jive.core._serializeToFormVars({
      after: options.after,
      anchor: options.anchor,
      before: options.before,
      excludeReplies: options.excludeReplies,
      groupID: options.groupID,
      inviterID: options.inviterID,
      inviteeID: options.inviteeID,
      limit: options.limit,
      offset: options.offset,
      q: options.q,
      type: options.type
    });
    var url = options.findUrl + (params ? '?' + params : '');

    //console.log('---> JSON GET: ' + url);
    var request = osapi.jive.core.get({ v: 'v2', href: url });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      var dataOut = response;
      if(!osapi.jive.core._isError(response)) {
        var process = osapi.jive.core._newObjectSuccessCallback({
          className: options.className,
          findUrl: options.findUrl,
          jsClass: options.jsClass,
          jsonPath: options.jsonPath,
          multiple: true,
          success: function(data) { dataOut = new osapi.jive.core.Response({ data: data }); }
        });
        process(response.content);
      } else {
        dataOut = osapi.jive.core._createErrorResponse(response);
      }
      return dataOut;
    });
    return request;
  },

  /*
   * Get a collection of Core API JSON objects via JSON RPC.
   *
   * @param options {Object} A javascript object that can override the default options
   * @param options.limit {Number} The number of results to return. Defaults to 10.
   * @param options.offset {Number} The number of items to skip before starting to return items. Defaults to 0.
   * @param callback {Function} The function that should be called with the results.
   * @private
   */
  getCollectionWithCallback: function(options, callback) {
    //console.log('---> getCollectionWithCallback()');
    this.getCollection(options).execute(callback);
  },

  /*
   * Get a single JSON object via Ajax. Sends the result to the callback function in a form that is similar
   * to what is defined by OpenSocial.
   * 
   * @param options {Object} A javascript object that can override the default options.
   * @private
   */
  getObject: function(options) {
    //console.log('---> getObject()');

    options = options || {};
    if(!options.jsonPath) {
      throw new Error('Unable to fetch collection. Please specify "jsonPath" in the call');
    }
    if(!options.findUrl) {
      throw new Error('Unable to fetch collection. Please specify "findUrl" in the call');
    }
    
    //console.log('---> JSON GET: ' + options.findUrl);
    var request = osapi.jive.core.get({ v: 'v2', href: options.findUrl });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      var dataOut = response;
      if(!osapi.jive.core._isError(response)) {
        var process = osapi.jive.core._newObjectSuccessCallback({
          className: options.className,
          findUrl: options.findUrl,
          jsClass: options.jsClass,
          jsonPath: options.jsonPath,
          multiple: false,
          success: function(data) { dataOut = new osapi.jive.core.Response({ data: data }); }
        });
        process(response.content);
      } else {
        dataOut = osapi.jive.core._createErrorResponse(response);
      }
      return dataOut;
    });
    return request;
  },

  /*
   * Get a single JSON object via Ajax. Sends the result to the callback function in a form that is similar
   * to what is defined by OpenSocial.
   *
   * @param options {Object} A javascript object that can override the default options.
   * @param callback {Function} The function to call when response is obtained.
   * @private
   */
  getObjectWithCallback: function(options, callback) {
    //console.log('---> getObjectWithCallback()');
    this.getObject(options).execute(callback);
  },

  /*
   * Get a single object or a collection, depending if id is "all" or a number
   *
   * @param id {Integer|String} Unique id of the object, or the string "all"
   * @param options {Object} A javascript object that can override the default options
   * @private
   */
  getObjectOrCollection: function(id, options) {
    options = osapi.jive.extend({
      collectionUrl : '/' + options.className.toLowerCase() + 's',
      objectUrl     : '/' + options.className.toLowerCase() + 's/' + id
    }, options || {});

    if(id == 'all') {
      return this.getCollection(osapi.jive.extend({findUrl: options.collectionUrl}, options));
    } else {
      return this.getObject(osapi.jive.extend({findUrl: options.objectUrl}, options));
    }
  },

  /*
   * Get a single object or a collection, depending if id is "all" or a number
   *
   * @param id {Integer|String} Unique id of the object, or the string "all"
   * @param options {Object} A javascript object that can override the default options
   * @param callback {Function} The function to call when response is obtained.
   * @private
   */
  getObjectOrCollectionWithCallback: function(id, options, callback) {
    this.getObjectOrCollection(id, options).execute(callback);
  },

  /*
   * Create a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @private
   */
  createObject: function(options) {
    //console.log('---> createObject()');
    //console.log(options);

    if(!options.createUrl) {
      throw new Error('Unable to create object. Please specify "createUrl" in the call');
    }

    //console.log('JSON POST: ' + options.createUrl);
    var request = osapi.jive.core.post({ v: 'v2', href: options.createUrl, params: options.params });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      //console.log(response);
      if(!osapi.jive.core._isError(response)) {
        return new osapi.jive.core.Response(osapi.jive.core._mapContentToData(response, options));
      } else {
        return osapi.jive.core._createErrorResponse(response);
      }
    });
    return request;
  },

  /*
   * Create a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @param callback {Function} The function to call when response is obtained.
   * @private
   */
  createObjectWithCallback: function(options, callback) {
    //console.log('---> createObjectWithCallback()');
    //console.log(options);
    this.createObject(options).execute(callback);
  },

  /*
   * Update a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @private
   */
  updateObject: function(options) {
    if(!options.updateUrl) {
      throw new Error('Unable to update object. Please specify "updateUrl" in the call');
    }

    //console.log('---> JSON PUT: ' + options.updateUrl, options.body);
    var request = osapi.jive.core.put({ v: 'v2', href: options.updateUrl, body: options.body });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      //console.log(response);
      if(!osapi.jive.core._isError(response)) {
        return new osapi.jive.core.Response(osapi.jive.core._mapContentToData(response, options));
      } else {
        return osapi.jive.core._createErrorResponse(response);
      }
    });
    return request;
  },

  /*
   * Update a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @param callback {Function} The function to call when response is obtained.
   * @private
   */
  updateObjectWithCallback: function(options, callback) {
    this.updateObject(options).execute(callback);
  },

  /*
   * Destroy a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @private
   */
  destroyObject: function(options) {
    if(!options.destroyUrl) {
      throw new Error('Unable to destroy object. Please specify "destroyUrl" in the call');
    }

    console.log('---> JSON DELETE: ' + options.destroyUrl);
    var request = osapi.jive.core['delete']({ v: 'v2', href: options.destroyUrl });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      console.log(response);
      if(!osapi.jive.core._isError(response)) {
        return new osapi.jive.core.Response(osapi.jive.core._mapContentToData(response));
      } else {
        return osapi.jive.core._createErrorResponse(response);
      }
    });
    return request;
  },

  /*
   * Destroy a single OpenClient JSON object via Ajax
   *
   * @param options {Object} A javascript object that can override the default options
   * @param callback {Function} The function to call when response is obtained.
   * @private
   */
  destroyObjectWithCallback: function(options, callback) {
    this.destroyObject(options).execute(callback);
  },

  //--------------------------------------------------------------------------------------------------------------------
  // Helper methods
  //--------------------------------------------------------------------------------------------------------------------

  /*
   * Pseudo-private: Returns a function that will be used as the
   * success callback in the other osapi.jive.core utility methods.
   * @private
   */
  _newObjectSuccessCallback: function(options) {
    return function(responseJSON) {
      // Grab object out of response JSON
      var object = osapi.jive.jsonPathLite(responseJSON, options.jsonPath);
      //console.log('--------------------------------------------------------------------------------');
      //console.log('---> jsonPath: ' + options.jsonPath);
      //console.log('---> className: ' + options.className);
      //console.log(responseJSON);

      if(object === true || object === false) { // if its a boolean, just return it
        //console.log('---> converting json to boolean');
        options.success(object);
      } else if (options.multiple) {
        //console.log('---> json has multiple items')
        // If we find an array of objects at the path we expected
        if(osapi.jive.isArray(object)) {
          //console.log('---> converting data array');
          // Convert each JSON object into an instance of it's OpenClient class
          var objects = osapi.jive.map(object, function(obj) {
            var jsClass = osapi.jive.core._getJSClass(options, obj);
            return new jsClass(obj, options);
          });
          osapi.jive.core._addNavigationLink(objects, responseJSON, 'next', options.className);
          osapi.jive.core._addNavigationLink(objects, responseJSON, 'previous', options.className);

          // Execute the success callback with the objects
          options.success(objects);
        } else if (!object) {
          //console.log('---> array is empty');
          // Our Java-based JSON encoder returns an empty string when given an empty array (WTF). It will look like {"ClassNameCollection" : ""}
          // If it is returned this way, the osapi.jive.jsonPathLite call above will return null. In that case, lets return an empty array.
          options.success([]);
        } else {
          //console.log('---> array contains a single object');
          // Our wonderful Java-based JSON encoder will return an array containing one object as just the object, without a containing array.
          // If that's the case, enclose it in an array and return it.
          var jsClass = osapi.jive.core._getJSClass(options, object);
          options.success([new jsClass(object)]);
        }

      } else if(object) { // if its an object, instantiate an instance of the class and return that
        //console.log('---> json has a single item')
        var jsClass = osapi.jive.core._getJSClass(options, object);
        options.success(new jsClass(object, options));
      } else { // otherwise return the JSON directly
        //console.log('---> giving up. using json directly');
        options.success(responseJSON);
      }
    };
  },

  /*
   * Get the Javascript class that that should be instantiated based on the following algorithm:
   * <ul>
   * <li>If options.jsClass exists, use it.</li>
   * <li>If options.className exists and does not begin with '$.' use osapi.jive.core[options.className]</li>
   * <li>If options.classname exists and begins with '$.' use the string following '$.' as the name of the member
   * of the json object that will be queried for the final portion of the class name.</li>
   * </ul>
   * @param options {Object} Where to look for class name to use
   * @param json {Object} The json object that can be inspected for a class name.
   * @return {Class} The class to instantiate.
   * @private
   */
  _getJSClass: function(options, json) {
    var jsClass;
    if(options) {
      jsClass = options['jsClass'];
      if(!jsClass) {
        var className = options.className;
        if(className) {
          var result = className.match(/^\$\.(.*)/);
          if(result) {
            var classNameMember = result[1];
            className = osapi.jive.core._titleize(json[classNameMember]);
          }
          jsClass = osapi.jive.core[className];
        }
      }
    }
    jsClass = jsClass || Object;
    //console.log('---> Using class: ' + jsClass);
    return jsClass;
  },

  /*
   * Add a link to the given array based on what is in the json object.
   * 
   * @param {Array} array The array to which the link should be added.
   * @param {Object} json The JSON object that contains the information for the link to be added.
   * @param {String} linkName The name of the link to be added. This also is used to find the needed data in JSON object.
   * @param {Function} jsClass The Core API class that is used when the link is dereferenced.
   * @private
   */
  _addNavigationLink: function(array, json, linkName, jsClass) {
    json.links = json.links || {};
    var isLinkFound = json.links[linkName];
    //console.log('---> ' + linkName + ' was' + (isLinkFound ? '' : ' not') + ' added');
    if(isLinkFound) {
      array[linkName] = {
        get: function() {
          var baseUrl = osapi.jive.core._parseBaseURL(json.links[linkName]);
          var params = osapi.jive.core._parseParams(json.links[linkName]);
          osapi.jive.extend(params, {
            className: jsClass,
            findUrl: osapi.jive.core._getRelativeUrl(baseUrl),
            jsonPath: '/data'
          });
          return osapi.jive.core.getCollection(params);
        }
      };
    };
  },

  /*
   * Map the 'content' element returned by the server to 'data' to be consistent with the way that the get methods
   * work. 
   * @param {Object} obj The object in which to do the mapping
   * @returns The mapped object.
   * @private
   */
  _mapContentToData: function(obj, options) {
    if(obj && obj.content) {
      var jsClass = osapi.jive.core._getJSClass(options);
      if(osapi.jive.isArray(obj.content)) {
        obj.data = new Array();
        osapi.jive.each(obj.content, function(i, content) {
          obj.data[i] = new jsClass(content);
        });
      } else {
        obj.data = new jsClass(obj.content);
      }
      delete obj.content;
    }
    return obj;
  }

});

//----------------------------------------------------------------------------------------------------------------------
// Support classes
//----------------------------------------------------------------------------------------------------------------------

/**
 * <p>A request that can be executed to communicate with the Jive server.</p>
 * @class Request
 * @namespace osapi.jive.core
 */
osapi.jive.core.Request = function(options) {
  var that = this;
  this.options = osapi.jive.extend({
    method: function() {}
  }, options || {});

  /**
   * Send the request to the server via JSON RPC. The result will be sent to the callback function as an instance of
   * <a href="osapi.jive.core.Response.html">osapi.jive.core.Response</a>.
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object</code>
   *   <code>var request = osapi.jive.core.users.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var obj = response.data;</code>
   *   <code class='comment'>    // do something with the result</code>
   *   <code>  } else {</code>
   *   <code class='comment'>    // handle the error</code>
   *   <code>    alert(response.error.message);</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method execute
   * @param callback {Function} The method that should be called with the result of the request.
   */
  this.execute = function(callback) {
    this.options.method(callback);
  };
};

/**
 * <p>Represents a response from the Jive server.</p>
 * @class Response
 * @namespace osapi.jive.core
 */
osapi.jive.core.Response = function(options) {
  var that = this;
  osapi.jive.extend(this, options || {});

  /**
   * <p>Contains the result value that was obtained from the server. This property is only defined if there was not an
   * error.</p>
   * @property data
   * @type Object
   */

  /**
   * <p>Contains the error that resulted from the server communication. This property is only defined if there was an
   * error.</p>
   * @property error
   * @type <a href="osapi.jive.core.Error.html">Error</a>
   */
};

/**
 * <p>Represents an error from the Jive server.
 * @class Error
 * @namespace osapi.jive.core
 */
osapi.jive.core.Error = function(options) {
  var that = this;
  osapi.jive.extend(this, options || {});

  /**
   * <p>The numeric code for the error</p>
   * @property code
   * @type Integer
   */
  
  /**
   * <p>A message returned by the server that describes the error in a human readable message </p>
   * @property message
   * @type String
   */
};


/********** core/util.js **********/

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
osapi.jive.extend(osapi.jive.core, {

  //--------------------------------------------------------------------------------------------------------------------
  // Success handing functions
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Create a success reponse to be passed back to the client via a callback function.
   * 
   * @param options {Object} Standard osapi.jive.core ajax options
   * @private
   */
  _createSuccessResponse : function(response) {
    response = response || {};
    //console.log('---> Constructing success');
    //console.log(response);
    return new osapi.jive.core.Response({
      data: response.data
    });
  },

  //--------------------------------------------------------------------------------------------------------------------
  // Error handling functions
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Create an error response to be passed back to the client via a callback function.
   * 
   * @param options {Object} Standard osapi.jive.core ajax options
   * @private
   */
  _createErrorResponse: function(response) {
    response = response || {};
    //console.log('---> Constructing error');
    //console.log(response);
    if(response.error) {
      var code = response.error.code;
      var message = response.error.message;
    } else {
      var code = response.content ? response.content.code : response.code;
      var message = response.content ? response.content.message : response.message;
      if(typeof(code) === 'undefined' || code === null) {
        code = response.status;
      }
    }
    return new osapi.jive.core.Response({
      error: new osapi.jive.core.Error({
        code: code,
        message: message
      })
    });
  },

  _isError: function(response) {
    var foundError = response.error;
    foundError = foundError || response.status >= 400;
    return foundError;
  },

  //--------------------------------------------------------------------------------------------------------------------
  // String functions
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Converts a word's first letter to uppercase. Example: "hello" becomes "Hello"
   *
   * @param string {String} The string to titleize
   * @private
   */
  _titleize: function(string) {
    var titleizedString = string.replace(/\b\w+\b/g, function(word) {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    return titleizedString.split(' ').join('');
  },

 /**
   * Remove the whitespace from the beginning and end of a string.
   *
   * @param string {String} The string to trim.
   * @private
   */
  _trimString: function(string) {
    return string.replace(/^\s+|\s+$/g, "");
  },

  //--------------------------------------------------------------------------------------------------------------------
  // HTTP functions
  //--------------------------------------------------------------------------------------------------------------------

  _baseUrl: function() {
    if(typeof gadgets != 'undefined') {
      var rootUrl  = gadgets.util.getUrlParameters().parent;
      return rootUrl + osapi.jive.core.basePath;
    } else {
      return osapi.jive.core.basePath;
    }
  },

  _proxyBaseUrl: function() {
    if(typeof gadgets != 'undefined') {
      var proxyUrl = gadgets.io.getProxyUrl();
      var rootUrl  = proxyUrl.split('?')[0].replace(/\/gadgets\/proxy/, '');
      return rootUrl + osapi.jive.core.basePath;
    } else {
      return osapi.jive.core.basePath;
    }
  },

  /**
   * Get the relative URL for the URL that is passed in.
   * 
   * @param url {String} The URL for which the absolute URL is desired.
   * @private
   */
  _getRelativeUrl: function(url) {
    if(typeof url != 'undefined') {
      var regex = /.*\/api\/core\/v2(.*)/;
      var result = url.match(regex);
      if(result != null) {
        return result[1];
      }
      return url;
    }
  },

  /**
   * Get the base portion of an url.
   * 
   * @param url {String} The full url to parse.
   * @return {String} The base portion of the url.
   * @private
   */
  _parseBaseURL: function(url) {
    var questionMarkIndex = url.indexOf('\?');
    var baseUrl = questionMarkIndex === -1 ? url : url.substring(0, questionMarkIndex);
    baseUrl = baseUrl.charAt(0) === '/' ? baseUrl : '/' + baseUrl;
    return baseUrl;
  },
  
  /**
   * Get the parameter values of an url.
   * 
   * @param url {String} The full url to parse.
   * @return {Object} An array like object that contains the parameter values.
   * @private
   */
  _parseParams: function(url) {
    var params = {};
    var questionMarkIndex = url.indexOf('\?');
    var parameters = url.substring(questionMarkIndex + 1, url.length);
    var parametersArray = parameters.split('&');
    osapi.jive.each(parametersArray, function(index, value) {
      var keyValueArray = value.split('=');
      params[keyValueArray[0]] = keyValueArray[1];
    });
    //console.log(params);
    return params;
  },

  /**
   * Serialize an object like 
   *   {"name": "foo", "color": "red", "imageURI": ["one.png", "two.png"]}
   * into 
   *   name=foo&color=red&imageURI=one.png&imageURI=two.png
   * 
   * @param obj {Object} The object containing keys and values to serialize into form variables.
   * @private
   */
  _serializeToFormVars: function(obj) {
    var inputs = [];
    osapi.jive.each(obj, function(key, val) {
      if (typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number') {
        inputs.push(key + "=" + escape(val));
      } else if (osapi.jive.isArray(val)) {
        for(var i = 0; i < val.length; i++) {
          inputs.push(key + "=" + escape(val[i]));
        }
      }
    });
    return inputs.join('&');
  },

  /**
   * Construct the URL that will be used for an upload operation.
   * 
   * @param obj {Object} The object to which the upload is being done
   * @param suffix {String} The suffix portion that comes after the id
   * @param relativeUrl {String} The extension from the base URL
   * @param token {String} The token to look for to determine if the id need to be appended
   *          or not
   * @param id {Integer} The id that may be put into the URL
   * @returns {String} The constructed URL.
   * @private
   * @static
   */
  _constructUploadActionUrl : function(obj, suffix, relativeUrl, token, id) {
    var baseUrl = osapi.jive.core._baseUrl();

    // if obj has a self resource, use that plus the suffix.
    if (obj && obj.resources && obj.resources.self) {
      if(obj.resources.self.ref.charAt(0) !== '/' && baseUrl.charAt(baseUrl.length - 1) !== '/') {
        baseUrl += '/';
      }
      return baseUrl + obj.resources.self.ref + '/' + suffix;
    }

    // if a relative URL was provided, use that. Check to see if the object id should be added.
    if (relativeUrl) {
      if(relativeUrl.charAt(0) !== '/'  && baseUrl.charAt(baseUrl.length - 1) !== '/') {
        baseUrl += '/';
      }
      var url = baseUrl + relativeUrl;
      if (url.charAt(url.length - 1) === '/') {
        url = url.substr(0, url.length - 2);
      }
      var regex = new RegExp('.*\/' + token + '$');
      if (regex.exec(url)) {
        url += '/' + id;
      }
      if (suffix) {
        url += '/' + suffix;
      }
      return url;
    }

    // if the passed in object is undefined just use the suffix.
    if (obj === undefined) {
      if(suffix) {
        if (baseUrl.charAt(baseUrl.length - 1) !== '/') {
          baseUrl += '/';
        }
        baseUrl += suffix;
      }
      return baseUrl;
    }
  }

});


/********** core/mixins.js **********/

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
osapi.jive.extend(osapi.jive.core, {

  /*
   * Map to translate link names to class names
   */
  linkToClassOverrideMap: {
    activities: 'ActivityContainer',
    answer: 'Message',
    attachments: 'Attachment',
    children: 'Space',
    content: '$.type',
    colleagues: 'User',
    comments: 'Comment',
    connections: 'User',
    discussions: 'Discussion',
    documents: 'Document',
    images: 'Image',
    inResponseTo: 'Message',
    invited: 'Invite',
    invites: 'Invite',
    likes: 'User',
    members: 'Member',
    manager: 'User',
    messages: 'Message',
    owner: 'User',
    parent: 'Space',
    participants: 'User',
    posts: 'Post',
    privateDiscussions: 'Discussion',
    privateDocuments: 'Document',
    projects: 'Project',
    replies: 'Message',
    reports: 'User',
    share: 'Share',
    updates: 'Update'
  },

  //--------------------------------------------------------------------------------------------------------------------
  // Property extention functions
  //--------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------------------------------------------------------------- ActivitiesHolder

  extendWithActivitiesProperty: function(obj) {
    if(obj.activities) {
      for(var i = 0; i < obj.activities.length; i++) {
        var activity = obj.activities[i];
        obj.activities[i] = new osapi.jive.core.Activity(activity);
      }
    }
  },

  //-------------------------------------------------------------------------------------------------- AttachmentsHolder
  /**
   * <p class="definition">Classes that use this extension will expose an attachments property.  This property will only be present
   * when the containing object actually has attachments.</p>
   * @class AttachmentsHolder
   * @namespace osapi.jive.impl
   */

  /**
   * <p>An array of Attachment objects describing the attachments stored with the parent object.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>attachments: [</code>
   *  <code class='property'>  {</code>
   *  <code class='property'>    "id": 1003,</code>
   *  <code class='property'>    "ref": "http://example.com/core/v1/attachments/1003",</code>
   *  <code class='property'>    "name": "test.png",</code>
   *  <code class='property'>    "contentType": "image/png",</code>
   *  <code class='property'>    "size": 14945</code>
   *  <code class='property'>  },</code>
   *  <code class='property'>]</code>
   * </div>
   * @property attachments
   * @type <a href="osapi.jive.core.Attachment.html">Attachment</a>[]
   */

  extendWithAttachmentsProperty: function(obj) {
    if(obj.attachments) {
      for(var i = 0; i < obj.attachments.length; i++){
        var attachment = obj.attachments[i];
        obj.attachments[i] = new osapi.jive.core.Attachment(attachment);
      }
    };
  },

  //------------------------------------------------------------------------------------------------------- AuthorHolder

  /**
   * <p class="definition">Classes that use this extension will expose an 'author' property that provides the
   * <a href="osapi.jive.core.User.html">user</a> that created the object.</p>
   * @class AuthorHolder
   * @namespace osapi.jive.impl
   */
  extendWithAuthorProperty: function(obj) {
    /**
     * <p>The user that is the author of the content.</p>
     * @property author
     * @type <a href="osapi.jive.core.User.html">User</a>
     */
    if(obj.author) {
      obj.author = new osapi.jive.core.User(obj.author);
    }
  },

  //--------------------------------------------------------------------------------------------- ContainerSummaryHolder

  /* containerSummaryHolder */
  /**
   * <p class="definition">A summary version of a Jive container.</p>
   * <p>A container is a place within Jive in which content can be created and stored. There are four types of 
   * containers that Jive supports by default</p>
   * <ul>
   * <li>Group</li>
   * <li>Project</li>
   * <li>Space</li>
   * <li>User</li>
   * <ul>
   * @class ContainerSummaryHolder
   * @namespace osapi.jive.impl
   */
  
  /* containerSummaryHolder.type */
  /**
   * <p>The type of the container.</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>type : "user"</code></div>
   * @property containerSummary.type
   * @type group | project | space | user
   */
  extendWithContainerSummaryProperty: function(obj) {
    if(obj.containerSummary) {
      switch(obj.containerSummary.type) {

      /* containerSummaryHolder.group */
      /**
       * <p>If containerSummary.type equals 'group', then this property will be defined. It contains a summary version of
       * the group container. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>name</td><td>String</td><td>The name of the group</td></tr>
       * <tr><td>type</td><td>String</td><td>Will be 'group'</td></tr>
       * </table></p>
       * <p><span class='title'>Availability:</span> When containerSummary.type == 'group'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full group object, simply do the following:
       *   <code>if(object.containerSummary.type == 'group') {</code>
       *   <code class="comment">  // get the request object for the group.</code>
       *   <code>  var request = object.containerSummary.group.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property containerSummary.group
       * @type <a href="osapi.jive.core.Group.html">Group</a>
       */
      case 'group':
        obj.containerSummary.group = new osapi.jive.core.Group(obj.containerSummary);
        break;

      /* containerSummaryHolder.group */
      /**
       * <p>If containerSummary.type equals 'project', then this property will be defined. It contains a summary version
       * of the project container. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>name</td><td>String</td><td>The name of the project</td></tr>
       * <tr><td>type</td><td>String</td><td>Will be 'project'</td></tr>
       * </table></p>
       * <p><span class='title'>Availability:</span> When containerSummary.type == 'project'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full project object, simply do the following:
       *   <code>if(object.containerSummary.type == 'project') {</code>
       *   <code class="comment">  // get the request object for the project.</code>
       *   <code>  var request = object.containerSummary.project.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property containerSummary.project
       * @type <a href="osapi.jive.core.Project.html">Project</a>
       */
      case 'project':
        obj.containerSummary.project = new osapi.jive.core.Project(obj.containerSummary);
        break;

      /* containerSummaryHolder.space */
      /**
       * <p>If containerSummary.type equals 'space', then this property will be defined. It contains a summary version of
       * the space container. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>name</td><td>String</td><td>The name of the space</td></tr>
       * <tr><td>type</td><td>String</td><td>Will be 'space'</td></tr>
       * </table></p>
       * <p><span class='title'>Availability:</span> When containerSummary.type == 'space'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full space object, simply do the following:
       *   <code>if(object.containerSummary.type == 'space') {</code>
       *   <code class="comment">  // get the request object for the space.</code>
       *   <code>  var request = object.containerSummary.space.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property containerSummary.space
       * @type <a href="osapi.jive.core.Space.html">Space</a>
       */
      case 'space':
        obj.containerSummary.space = new osapi.jive.core.Space(obj.containerSummary);
        break;

      /* containerSummaryHolder.user */
      /**
       * <p>If containerSummary.type equals 'user', then this property will be defined. It contains a summary version of
       * the user container. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>name</td><td>String</td><td>The name of the user</td></tr>
       * <tr><td>type</td><td>String</td><td>Will be 'user'</td></tr>
       * </table></p>
       * <p><span class='title'>Availability:</span> When containerSummary.type == 'user'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full user object, simply do the following:
       *   <code>if(object.containerSummary.type == 'user') {</code>
       *   <code class="comment">  // get the request object for the user.</code>
       *   <code>  var request = object.containerSummary.user.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property containerSummary.user
       * @type <a href="osapi.jive.core.User.html">User</a>
       */
      case 'user':
        obj.containerSummary.user = new osapi.jive.core.User(obj.containerSummary);
        break;
      }
    }

    /* containerSummaryHolder.get */
    /**
     * <p>Get the full version of the container object.</p>
     * <p><span class='title'>Availability:</span> Always</p>
     * @method containerSummary.get
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that,
     * when executed, will return the full version of the container object. The type of the full object will match the
     * type of the summary object.
     */

  },

  //------------------------------------------------------------------------------------------------------ ContentHolder
  
  /**
   * <p class="definition">Classes that use this extention will expose a 'content' property that provides access to
   * the object's content.</p>
   * @class ContentHolder
   * @namespace osapi.jive.impl
   */
  
  /* content.text */
  /**
   * <p>The textual content.</p>
   * @property content.text
   * @type String 
   */
  
  /* content.type */
  /**
   * <p>The mime type of the content.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>type: "text/html"</code></div>
   * @property content.type
   * @type String
   */

  //------------------------------------------------------------------------------------------------ EntitySummaryHolder

  /* entitySummaryHolder */
  /**
   * <p class="definition">A summary version of a Jive content element.</p>
   * <p>Examples of content elements that are supported by default by Jive are:</p>
   * <ul>
   * <li>Comment</li>
   * <li>Discussion</li>
   * <li>Document</li>
   * <li>Message</li>
   * <li>Post</li>
   * <li>Update</li>
   * <ul>
   * @class EntitySummaryHolder
   * @namespace osapi.jive.impl
   */

  /* entitySummaryHolder.type */
  /**
   * <p>The type of the content element.</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>type: "update"</code></div>
   * @property entitySummary.type
   * @type comment&nbsp;|<br/>discussion&nbsp;|<br/>document&nbsp;|</br/>message&nbsp;|<br/>post&nbsp;|<br/>update
   */
  extendWithEntitySummaryProperty: function(obj) {
    if(obj.entitySummary) {
      if(obj.entitySummary.resources && obj.entitySummary.resources.self) {
        var options = {
          findUrl: obj.entitySummary.resources.self.ref
        };
      }
      var type = obj.entitySummary.type;
      if(typeof(type) !== 'undefined' && type != null) {
        var className = osapi.jive.core._titleize(type);
        if ( typeof osapi.jive.core[className] === "function" ) {
            obj.entitySummary[type] = new osapi.jive.core[className](obj.entitySummary, options);
        } else {
            obj.entitySummary[type] = {}; // something not null
        }
      }

      /* entitySummaryHolder.comment */
      /**
       * <p>If entitySummary.type equals 'comment', then this property will be defined. It contains a summary version of
       * the comment. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the post has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the post</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the comment</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'comment'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full comment object, simply do the following:
       *   <code>if(object.entitySummary.type == 'comment') {</code>
       *   <code class="comment">  // get the request object for the comment.</code>
       *   <code>  var request = object.entitySummary.comment.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.comment
       * @type <a href="osapi.jive.core.Comment.html">Comment</a>
       */

      /* entitySummaryHolder.discussion */
      /**
       * <p>If entitySummary.type equals 'discussion', then this property will be defined. It contains a summary version
       * of the discussion. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>subject</td><td>String</td><td>The subject of the discussion</td></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the discussion has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the discussion</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the discussion</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'discussion'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full discussion object, simply do the following:
       *   <code>if(object.entitySummary.type == 'discussion') {</code>
       *   <code class="comment">  // get the request object for the discussion.</code>
       *   <code>  var request = object.entitySummary.discussion.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.discussion
       * @type <a href="osapi.jive.core.Discusssion">Discussion</a>
       */

      /* entitySummaryHolder.document */
      /**
       * <p>If entitySummary.type equals 'document', then this property will be defined. It contains a summary version of
       * the document. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>subject</td><td>String</td><td>The subject of the document</td></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the document has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the document</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the document</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'document'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full document object, simply do the following:
       *   <code>if(object.entitySummary.type == 'document') {</code>
       *   <code class="comment">  // get the request object for the document.</code>
       *   <code>  var request = object.entitySummary.document.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.document
       * @type <a href="osapi.jive.core.Document">Document</a>
       */

      /* entitySummaryHolder.message */
      /**
       * <p>If entitySummary.type equals 'message', then this property will be defined. It contains a summary version of
       * the message. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>subject</td><td>String</td><td>The subject of the message</td></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the message has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the message</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the message</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'message'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full message object, simply do the following:
       *   <code>if(object.entitySummary.type == 'message') {</code>
       *   <code class="comment">  // get the request object for the message.</code>
       *   <code>  var request = object.entitySummary.message.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.message
       * @type <a href="osapi.jive.core.Message">Message</a>
       */

      /* entitySummaryHolder.post */
      /**
       * <p>If entitySummary.type equals 'post', then this property will be defined. It contains a summary version of the
       * blog post. This summary object contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>subject</td><td>String</td><td>The subject of the blog post</td></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the post has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the post</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the blog post</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'post'</p>
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full blog post object, simply do the following:
       *   <code>if(object.entitySummary.type == 'post') {</code>
       *   <code class="comment">// get the request object for the blog post.</code>
       *   <code>var request = object.entitySummary.post.get();</code>
       *   <code class="comment">// execute the request</code>
       *   <code>request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.post
       * @type <a href="osapi.jive.core.Post">Post</a>
       */

      /* entitySummaryHolder.update */
      /**
       * <p>If entitySummary.type equals 'update' then this property will be defined. It is a summary version of the
       * update. This is a summary object. It contains the following properties:</p>
       * <p><table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>subject</td><td>String</td><td>The subject of the update</td></tr>
       * <tr><td>replyCount</td><td>Integer</td><td>The number of replies that the update has received</td></tr>
       * <tr><td>likeCount</td><td>Integer</td><td>The number of people who have indicated that they like the update</td></tr>
       * <tr><td>contentSummary</td><td>String</td><td>A summarized version of the update</td></tr> 
       * </table></p>
       * <p><span class='title'>Availability:</span> When entitySummary.type == 'update'
       * <p><span class='title'>Example:</span></p>
       * <div class='example'>In order to get the full update object, simply do the following:
       *   <code>if(object.entitySummary.type == 'update') {</code>
       *   <code class="comment">  // get the request object for the update.</code>
       *   <code>  var request = object.entitySummary.update.get();</code>
       *   <code class="comment">  // execute the request</code>
       *   <code>  request.execute(function(response) { ... });</code>
       *   <code>}</code>
       * </div>
       * @property entitySummary.update
       * @type <a href="osapi.jive.core.Update">Update</a>
       */

      /* entitySummaryHolder.get */
      /**
       * <p>Get the full version of the entity object.</p>
       * <p><span class='title'>Availability:</span> Always</p>
       * @method entitySummary.get
       * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that,
       * when executed, will return the full version of the entity object. The type of the full object will match the
       * type of the summary object.
       */
  }
},

  //-------------------------------------------------------------------------------------------------------- GroupHolder
  extendWithGroupProperty: function(obj) {
    if(obj.group) {
      obj.group = new osapi.jive.core.Group(obj.group);
    }
  },

  //----------------------------------------------------------------------------------------------------------- IDHolder
  /**
   * <p class="definition">Classes that use this extension will expose an ID property.</p>
   * @class IDHolder
   * @namespace osapi.jive.impl
   */

  /**
   * <p>An identifier that is assigned to the object by the Jive system.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>id: 1001</code></div>
   * @property id
   * @type Integer
   */

  //-------------------------------------------------------------------------------------------------------- ImageHolder

  /**
   * <p class="definition">This Class provides methods for dealing with <a href="osapi.jive.core.Image.html">images</a> in a content type.</p>
   * @class ImageHolder
   * @namespace osapi.jive.impl
   */
  /**
   * Get the images that are contained in the content item.
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting images.</code>
   *   <code>var request = object.images.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method images.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, returns the collection of images.
   */
  extendWithImageURL: function(obj, resourceName) {
    // add the property
    obj.resources = obj.resources || {};
    if(obj.resources[resourceName]) {
      if(osapi.jive.inArray('GET', obj.resources[resourceName].allowed) != -1) {
        //console.log('---> Adding property ' + resourceName + 'URL' + ': ' + 
        //  osapi.jive.core._baseUrl() + obj.resources[resourceName].ref);
        obj[resourceName + 'URL'] = osapi.jive.core._baseUrl() + obj.resources[resourceName].ref;
      }
    }
  },

  //------------------------------------------------------------------------------------------------- ParticipantsHolder

  /**
   * <p class="definition">Classes that use this extension will expose an 'participants' property that provides the
   * <a href="osapi.jive.core.User.html">user</a>s that are participating.</p>
   * @class ParticipantsHolder
   * @namespace osapi.jive.impl
   */
  extendWithParticipantsProperty: function(obj) {
    /**
     * <p>The users that are participating.</p>
     * @property participants
     * @type <a href="osapi.jive.core.User.html">User</a>
     */
    if(obj.participants) {
      for(var i = 0; i < obj.participants.length; i++) {
        var participant = obj.participants[i];
        obj.participants[i] = new osapi.jive.core.User(participant);
      }
    }

    /**
     * <p>bla bla bla</p>
     * @method participants.create
     * @return ???
     */
    /**
     * <p>bla bla bla</p>
     * @method participants.get
     * @return ???
     */
  },

  //--------------------------------------------------------------------------------------------------------- UserHolder

  /**
   * <p class="definition">Classes that use this extension will expose an 'user' property that provides the
   * <a href="osapi.jive.core.User.html">user</a> for the object.</p>
   * @class UserHolder
   * @namespace osapi.jive.impl
   */
  extendWithUserProperty: function(obj, name) {
    /**
     * <p>The user.</p>
     * @property user
     * @type <a href="osapi.jive.core.User.html">User</a>
     */
    if(typeof(name) === 'undefined' || name === null) {
      name = 'user';
    }
    if(obj[name]) {
      obj[name] = new osapi.jive.core.User(obj[name]);
    }
  },

  //--------------------------------------------------------------------------------------------------------------------
  // Method extention functions
  //--------------------------------------------------------------------------------------------------------------------

  _determineClass: function(linkName, reference) {
    if(linkName === 'container') {
      if(reference.search(/groups/ != -1)) { return 'Group'; }
      if(reference.search(/projects/ != -1)) { return 'Project'; }
      if(reference.search(/spaces/ != -1)) { return 'Space'; }
      if(reference.search(/users/ != -1)) { return 'User'; }
    } else {
      return osapi.jive.core.linkToClassOverrideMap[linkName] 
        ? osapi.jive.core.linkToClassOverrideMap[linkName] :osapi.jive.core._titleize(linkName);
    }
  },

  extendWithResourcesMethods: function(obj) {
    var resources = obj['resources'] || {};
    osapi.jive.each(resources, function(linkName, linkInfo) {
      if (!resources.hasOwnProperty(linkName)) {
        return;
      }
      obj[linkName] = obj[linkName] || {};

      if(osapi.jive.inArray('GET', linkInfo.allowed) != -1) {
        //console.log('---> establishing a get method for: ' + linkName);
        obj[linkName].get = function(options) {
          options = options || {};
          var multipleItems = linkInfo.ref.match(/s$/)
                           || linkInfo.ref.match(/.*\/activity$/)
                           || linkInfo.ref.match(/.*\/children$/)
                           || linkInfo.ref.match(/.*\/content$/)
                           || linkInfo.ref.match(/.*\/invited$/)
                           || linkInfo.ref.match(/.*\/invites$/);
          var className = osapi.jive.core._determineClass(linkName, linkInfo.ref);
          //console.log('---> linkName: ' + linkName + ', className: ' + className);
          if(!multipleItems) {
            //console.log('---> getting a single object from: ' + linkInfo.ref);
            return osapi.jive.core.getObject({
              className: className,
              findUrl: osapi.jive.core._getRelativeUrl(linkInfo.ref),
              jsonPath: '/'
            });
          } else {
            //console.log('---> getting multiple objects from: ' + linkInfo.ref);
            // images break the rule and are not contained in a data element
            var jsonPath = linkName === 'images' ? '/' : '/data';
            var params = {
              after: options.after,
              before: options.before,
              className: className,
              findUrl: osapi.jive.core._getRelativeUrl(linkInfo.ref),
              jsonPath: jsonPath,
              limit: options.limit,
              offset: options.offset,
              q: options.query,
              type: options.type
            };
            return osapi.jive.core.getCollection(params);
          }
        };
      };

      if(osapi.jive.inArray('POST', linkInfo.allowed) != -1) {
        //console.log('---> establishing a create method for: ' + linkName);
        obj[linkName].create = function(params) {
          var className = osapi.jive.core._determineClass(linkName, linkInfo.ref);
          //console.log('---> creating object using: ' + linkInfo.ref);
          //console.log(params);
          var options = {
            className: className,
            createUrl: osapi.jive.core._getRelativeUrl(linkInfo.ref),
            params: params
          };
          return osapi.jive.core.createObject(options);
        };
      };

      if(osapi.jive.inArray('DELETE', linkInfo.allowed) != -1) {
        //console.log('---> establishing a destroy method for: ' + linkName);
        obj[linkName].destroy = function() {
          //console.log('---> destroying object using: ' + linkInfo.ref);
          return osapi.jive.core.destroyObject({
            destroyUrl: osapi.jive.core._getRelativeUrl(linkInfo.ref)
          });
        };
      };
    });
  },

//------------------------------------------------------------------------------------------------- AttachmentUploadable

  /**
   * <p class="definition">Classes that use this extension will expose a method for requesting that an attachment be
   * uploaded and place on the object.</p>
   * @class AttachmentUploadable
   * @namespace osapi.jive.impl
   */
  /**
   * <p>Request that an attachment be uploaded to the object. This function will cause the container to pop up a file
   * dialog with which the user can select the attachment they wish to upload.</p>
   * @method requestAttachmentUpload
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  /**
   * <p class="definition">Provides method to control document uploading.</p>
   * @class DocumentUploadable
   * @namespace osapi.jive.impl
   */
  /**
   * <p>Request that a document be uploaded to the object. This function will cause the container to pop up a file
   * dialog with which the user can select the document they wish to upload.</p>
   * @method requestDocumentUpload
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  extendWithUploadMethods: function(obj, config) {
    obj[config.methodName] = function(callback, options) {
      options = options || {};
      //console.log('---> Executing: ' + methodName);
      //console.log('---> ActionUrl: ' + actionUrl);
      var token = shindig.auth.getSecurityToken();
      osapi.jive.extend(config, options, {core: true});
      var rpcCallback = function(item) {
        //console.log('---> Received callback');
        //console.log(item);
        if(typeof callback === 'function') {
          if(item.code) {
            callback(osapi.jive.core._createErrorResponse(item));
          } else {
            if(config.binaryDocument) {
              item = new osapi.jive.core.Document(item);
              if(item.content && item.content.binary && item.content.binary.ref) {
                item.content.binary.ref = osapi.jive.core._getRelativeUrl(item.content.binary.ref);
              }
            } else {
              if(item.ref) {
                item.ref = osapi.jive.core._getRelativeUrl(item.ref);
              }
            }
            callback(item);
          }
        }
      };
      gadgets.rpc.call( null, "request_core_api_upload", rpcCallback, null, config, token);
    };
  },

//-------------------------------------------------------------------------------------------------------- Commentable

  /**
   * <p class="definition">Classes that use this extension will expose methods for creating and retrieving
   * <a href="osapi.jive.core.Comment.html">comments</a> on content within the Jive system.</p>
   * @class Commentable
   * @namespace osapi.jive.impl
   */
  /* comments */
  /**
   * <p>Create a comment on this object for the currently logged in user.</p>
   * <p><span class='title'>Availability:</span> This method will only be defined if the logged in user has the permissions to create a
   * comment on this object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to create a comment.</code>
   *   <code>var request = object.comments.create({html: 'My comment'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method comments.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new comment.
   */
  /**
   * <p>Get the array of comments for this object</p>
   * <p><span class='title'>Availability:</span> Full object.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to retrieve all comments.</code>
   *   <code>var request = object.comments.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method comments.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>anchor</td><td>URI</a></td><td>false</td>
   * <td>Optional URI for a comment to anchor at. Specifying a anchor will try to return the page containing the anchor.
   * If the anchor could not be found then the first page of comments will be returned.</td>
   * <td></td></tr>
   * <tr><td>excludeReplies</td><td>Boolean</td><td>false</td><td>If true, then only top level comments will be
   * returned.</td><td><ul><li>Default value is false</li></ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of comments that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 comments will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * <tr><td>offset</td><td>Integer</td><td>false</td><td>The number of results which should be skipped in the returned
   * collection. For instance, if the first 25 results have already been retrieved then results after the 25th result
   * can be retrieved by specifying an offset of 25.</td><td><ul><li>Default value is 0</li><li>The minimum value for
   * the offset is 0, specifying anything less than 0 for the offset will result in an error.</li></ul></td></tr>
   * <tr><td>sort</td><td>'chronological' | 'threaded'</td><td>false</td><td>Specifies the order in which the comments
   * should be returned</td><td><ul><li>Default value is 'chronological'</li></ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, retrieves the list of <a href="osapi.jive.core.Comment.html">Comment</a> objects for this
   * object.
   */

  //--------------------------------------------------------------------------------------------------------- Followable

  /**
   * <p class="definition">Classes that use this extension will expose methods for 'following' and 'unfollowing' of
   * content within the Jive system.</p>
   * <p>When an item is followed,  <a href="osapi.jive.core.activities.html">activity</a> from that item will
   * be displayed in the user's activity stream.</p>
   * @class Followable
   * @namespace osapi.jive.impl
   */
  extendWithFollowMethods: function(obj) {
    obj.follower = obj.follower || {};
    obj.follower.exists = function() {
      if(obj.resources && obj.resources.follower) {
        return osapi.jive.inArray('GET', obj.resources.follower.allowed) != -1;
      } else {
        return false;
      }
    };
    /**
     * <p>Create a 'following' relationship between the currently logged in user and the object on which the method
     * is called.<p>
     * <p><span class='title'>Availability:</span> Full object. The method is defined only when the logged in user does not already have a
     * 'following' relationship with this object.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to start following.</code>
     *   <code>var request = object.follower.create();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method follower.create
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, creates the 'following' relationship. When the request is executed a following relationship is
     * created from the logged in user to this object.
     */
    /**
     * <p>Destroy a 'following' relationship between the currently logged in user and the object on which the method
     * is called.</p>
     * <p><span class='title'>Availability:</span> Full object. The method is defined only when the logged in user has a 'following'
     * relationship with this object.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to stop following.</code>
     *   <code>var request = object.follower.destroy();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method follower.destroy
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, removes the following relationship. When the request is executed a 'following' relationship is
     * removed from the logged in user to this object.
     */
    /**
     * <p>Checks to see if a 'following' relationship exists. Please note that this is a local call. This means that if
     * the state of the following relationship is changed, this method may not be accurate without refetching the
     * underlying object.</p>
     * <p><span class='title'>Availability:</span> Full object</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='code'>var isFollowing = object.follower.exists();</code></div>
     * @method follower.exists
     * @return {Boolean} True if there is a 'following' relationship from the currently logged in user to the object.
     * False otherwise.
     */
  },

  //------------------------------------------------------------------------------------------------------------ Likable

  /**
   * <p class="definition">Classes that use this extension will expose methods for 'liking' and 'unliking' of
   * content within the Jive system.</p>
   * @class Likable
   * @namespace osapi.jive.impl
   */
  extendWithLikeMethods: function(obj) {
    obj.like = obj.like || {};
    obj.like.exists = function() {
      if(obj.resources && obj.resources.like) {
        return osapi.jive.inArray('GET', obj.resources.like.allowed) != -1;
      } else {
        return false;
      }
    };
    
    /* like */
    /**
     * <p>Destroy a 'liking' relationship between the currently logged in user and the object on which the method
     * is called</p>
     * <p><span class='title'>Availability:</span> This method is only defined if the logged in user has a liking relationship with this
     * object.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to stop Liking.</code>
     *   <code>var request = object.like.destroy();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method like.destroy
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, removes the 'liking' relationship. When the request is executed a 'liking' relationship is
     * removed from the logged in user to this object.
     */
    /**
     * <p>Check to see if a liking relationship exists. Please note that this is a local call. This means that if the
     * state of the liking relationship is changed, this method may not be accurate without refetching the underlying
     * object.</p>
     * <p><span class='title'>Availability:</span> Always</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code>var isLiked = object.like.exists();</code></div>
     * @method like.exists
     * @return {Boolean}
     */

    /* likes */
    /**
     * <p>Create a 'liking' relationship between the currently logged in user and the object on which the method
     * is called.</p>
     * <p><span class='title'>Availability:</span> The method is defined only when the logged in user does not have a 'liking'
     * relationship with this object.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to start liking.</code>
     *   <code>var request = object.likes.create();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method likes.create
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, creates the 'liking' relationship. When the request is executed a 'liking' relationship is
     * created from the logged in user to this object.
     */
    /**
     * <p>Get a list of users that like the object.</p>
     * <p><span class='title'>Availability:</span> This method is only defined if the logged in user is allowed to see the list of liking
     * users for the object.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object for users who like the content.</code>
     *   <code>var request = object.likes.get();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method likes.get
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, returns an array of <a href="osapi.jive.core.User.html">User</a> objects that have
     * 'liked' this object.
     */
  },
    
  //------------------------------------------------------------------------------------------------------------ Mutable

  /**
   * <p class="definition">Classes that use this extension will expose an 'destroy' and 'update' methods if the logged
   * in user has rights to perform these operations on the object.</p>
   * @class Mutable
   * @namespace osapi.jive.impl
   */
  extendWithMutableMethods: function(obj, className) {
    obj.resources = obj.resources || {};

    /* destroy */
    /**
     * <p>Request that the server remove the object.</p>
     * <p><span class='title'>Availability:</span> This method is defined only if the logged in user is authorized to remove this object</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to delete the object.</code>
     *   <code>var request = object.destroy();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method destroy
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, will remove the object from the server.
     */
    var isDeleteSupported = obj.resources.self && osapi.jive.inArray('DELETE', obj.resources.self.allowed) != -1;
    //console.log('---> destroy method' + (isDeleteSupported ? '' : ' not') + ' added');
    if(isDeleteSupported) {
      obj.destroy = function() {
        return osapi.jive.core.destroyObject({
          destroyUrl: osapi.jive.core._getRelativeUrl(obj.resources.self.ref)
        });
      };
    };

    /* update */
    /**
     * <p>Send an updated version of an object to the server to be persisted.</p>
     * <p><b>Availability:</b> This method is defined only if the logged in user is authorized to update this object</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to update the object.</code>
     *   <code>var request = object.update();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method update
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, will update the server to the current values stored in the object.
     */
    var isUpdateSupported = obj.resources.self && osapi.jive.inArray('PUT', obj.resources.self.allowed) != -1;
    //console.log('---> update method' + (isUpdateSupported ? '' : ' not') + ' added');
    if(isUpdateSupported) {
      obj.update = function() {
        return osapi.jive.core.updateObject({
          body: obj,
          className: className,
          updateUrl: osapi.jive.core._getRelativeUrl(obj.resources.self.ref)
        });
      };
    };
  },

  //----------------------------------------------------------------------------------------------------------- Readable

  /**
   * <p class="definition">Classes that use this extension will be able to be marked as read or unread.</p>
   * @class Readable
   * @namespace osapi.jive.impl
   */
  /**
   * <p>Cause an object to be marked as read</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for marking the object as read</code>
   *   <code>var request = object.read.create();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method read.create
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, cause the post
   * to be marked as read.
   */
  /**
   * <p>Cause an object to be marked as unread</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for marking the object as unread</code>
   *   <code>var request = object.read.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method read.destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, cause the post
   * to be marked as unread.
   */

  //----------------------------------------------------------------------------------------------------------- Sharable

  /**
   * <p class="definition">Classes that use this extension will be able to be shared.</p>
   * @class Sharable
   * @namespace osapi.jive.impl
   */
  /**
   * <p>Share the object with one or more other users</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for sharing the object</code>
   *   <code>var request = object.share.create({userURIs:['/users/2002'], html:'This is interesting'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method share.create
   * @param html {String} The content of the message that will be sent to the users with which the object is being
   * shared
   * @param userURIs {Array} The array of user URIs for users with which the the object will be shared. The format of
   * the user URI is /users/<userId>
   */

  //------------------------------------------------------------------------------------------------------- Summarizable

  /**
   * <p class="definition">A summarizable class supports objects that contain a subset of the full data for that type.
   * </p> 
   * <p>Summarized objects are generally returned in arrays or as sub objects. This interface provides the means to get the
   * full version of the object.</p>
   * @class Summarizable
   * @namespace osapi.jive.impl
   */
  extendWithSummarizableMethods: function(obj, className) {
    obj.resources = obj.resources || {};

    /**
     * <p>Retrieve the full version of the object. This is useful when a collection of objects is retrieved from
     * another method. These will be summarized versions.</p>
     * <p><span class='title'>Example:</span></p>
     * <div class='example'><code class='comment'>// get the request object to get the full object.</code>
     *   <code>var request = object.get();</code>
     *   <code class='comment'>// execute the request</code>
     *   <code>request.execute(function(response) { ... });</code>
     * </div>
     * @method get
     * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
     * when executed, returns the full version of the object.
     */
    var isGetSupported = obj.resources.self && osapi.jive.inArray('GET', obj.resources.self.allowed) != -1;
    //console.log('---> get method' + (isGetSupported ? '' : ' not') + ' added');
    if(isGetSupported) {
      obj.get = function() {
        return osapi.jive.core.getObject({
          className: className,
          findUrl: osapi.jive.core._getRelativeUrl(obj.resources.self.ref),
          jsonPath: '/'
        });
      };
    };
  }

  //---------------------------------------------------------------------------------------------------------- Trackable

  /**
   * <p class="definition">Classes that use this extension will be able to be tracked and untracked.</p>
   * @class Trackable
   * @namespace osapi.jive.impl
   */
  /**
   * <p>Cause the logged in user to track the object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to track the object.</code>
   *   <code>var request = object.track.create();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * <p><b>Note:</b> This function may fail if it is called immediately after tracks.destroy() is called on the same
   * object due to system latency.</p>
   * @method track.create
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, causes the
   * logged in user to track the object.
   */
  /**
   * <p>Cause the logged in user to no longer track the object</p>
   * <div class='example'><code class='comment'>// get the request object to untrack the object.</code>
   *   <code>var request = object.tracks.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * <p><b>Note:</b> This function may fail if it is called immediately after tracks.create() is called on the same
   * object due to system latency.</p>
   * @method tracks.destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, causes the
   * logged in user to no longer track the object.
   */
  /**
   * <p>Determine if the logged in user is tracking the object or not</p>
   * <div class='example'><code class='comment'>// get the request object to determine if the object is being tracked.</code>
   *   <code>var request = object.tracks.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * <p><b>Note:</b> This function may return an incorrect value if it is called immediately after track.create() or
   * tracks.destroy() is called on the same object due to system latency.</p>
   * @method tracks.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, returns a user
   * object if the logged in user is tracking a object. An error will be returned if the logged in user is not tracking
   * the object.
   */

});



/********** core/osapi-overlay.js **********/

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

/*
 * This file overlays standard OSAPI methods to provide support for custom Jive
 * extensions that pre-process response data from the Core API before being
 * passed to user supplied callback functions.
 */

(function (){ // scoping function

var $newBatch = osapi.newBatch;

osapi.newBatch = function() {
    var batch = $newBatch.apply(this, arguments);
    osapi.jive.core._extendOsapiBatchRequestWithResponseInterceptorSupport(batch);
    return batch;
};

function intercept(interceptor, response) {
    if (interceptor.renderSilent === true) return response;
//    console.log("DataIntercept - before", interceptor, response);
    var out = interceptor(response) || response;
//    console.log("DataIntercept - after", interceptor, out);
    return out;
}

osapi.jive.extend(osapi.jive.core, {

    _extendOsapiRequestWithResponseInterceptor : function(request, responseInterceptor) {
        request._jive = request._jive || {};
        if (!request._jive.hasOwnProperty("responseInterceptor")) {
            var $execute = request.execute;
            request.execute = function(callback) {
                var di = this._jive.responseInterceptor;
                if (di && di instanceof Function) {
                    var callbackIntercept = function(response) {
                        response = intercept(di, response) || response;
                        var args = Array.prototype.slice.call(arguments);
                        args[0] = response;
                        return callback.apply(this, args);
                    };
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = callbackIntercept;
                    return $execute.apply(this, args);
                } else {
                    return $execute.apply(this, arguments);
                }
            };
        }
        request._jive.responseInterceptor = responseInterceptor;
    },

    _buildRequestWithStaticResponse : function(response) {
        return {
            _jive: {
                staticResponse:response
            },
            execute: function(callback) {
                callback(response);
            }
        };
    },

    _buildRequestWithStaticErrorResponse : function(message) {
        return this._buildRequestWithStaticResponse(osapi.jive.core._createErrorResponse({
            message: message
        }))
    },

    _extendOsapiBatchRequestWithResponseInterceptorSupport : function(request) {
        var $add = request.add;
        request.add = function(key, request) {
            this._jive = this._jive || {requestCount:0};
            var di = request._jive && request._jive.responseInterceptor;
            if (di && di instanceof Function) {
                this._jive.diContainer = this._jive.diContainer || [];
                var diContainer = this._jive.diContainer;
                diContainer.push({ key: key, responseInterceptor: di, request: request });
            }
            var sr = request._jive && request._jive.staticResponse;
            if (sr) {
                this._jive = this._jive || {};
                this._jive.srContainer = this._jive.srContainer || {};
                var srContainer = this._jive.srContainer;
                srContainer[key] = sr;
            } else {
                this._jive.requestCount++;
                return $add.apply(this, arguments);
            }
        };

        var $execute = request.execute;
        request.execute = function(callback) {
            if (this._jive && this._jive.diContainer && this._jive.diContainer.length) {
                var diContainer = this._jive.diContainer;
                var srContainer = this._jive.srContainer || {};
                var callbackIntercept = function(response) {
                    var restore = [];
                    for (var i = 0, l = diContainer.length; i < l; ++i) {
                        var key = diContainer[i].key;
                        if (response.hasOwnProperty(key) && response[key]) {
                            var content = response[key];
                            if (content) {
                                var di = diContainer[i].responseInterceptor;
                                var req = diContainer[i].request;
                                content = intercept(di, content) || content;
                                // hide the interceptor on the request to
                                // prevent it from being called twice
                                req._jive.responseInterceptor.renderSilent = true;
                                restore.push(req._jive.responseInterceptor);
                                response[key] = content;
                            }
                        }
                    }
                    osapi.jive.extend(response, srContainer); //
                    var result = callback.apply(this, arguments);
                    for (i = 0, l = restore.length; i < l; ++i) {
                        // restore the interceptor on the request so that it
                        // may be used again
                        delete restore[i].renderSilent;
                    }
                    return result;
                };
                var args = Array.prototype.slice.call(arguments);
                args[0] = callbackIntercept;
                return $execute.apply(this, args);
            } else if (this._jive && this._jive.srContainer) {
                // pure static response
                callback(this._jive.srContainer)
            } else {
                $execute.apply(this, arguments)
            }
        };
    }

});

})(); // end of scoping function


/********** core/Activity.js **********/

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
/**
 * <p class="definition">Represents one of more entries in the activity stream.<p>
 * @class ActivityContainer
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.ContainerSummaryHolder
 * @uses osapi.jive.impl.EntitySummaryHolder
 * @uses osapi.jive.impl.IDHolder
 */
osapi.jive.core.ActivityContainer = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.ActivityContainer');
  osapi.jive.extend(this, jsonResponse);

  var that = this;

  //--------------------------------------------------------------------------------------------------------- Properties

  /* activities */
  /**
   * <p>This a collection of activities that related to the given activity container</p>
   * @property activities
   * @type <a href="osapi.jive.core.Activity.html">Activity</a>[] 
   */
  for(i = 0; i < this.activities.length; i++) {
    var activity = this.activities[i];
    this.activities[i] = new osapi.jive.core.Activity(activity);
  }

  /* activityType */
  /**
   * <p>There are three types activities that are supported by the Jive system:</p>
   * <ul>
   * <li>created - A piece of content has been created.</li>
   * <li>modified - A piece of content has been modified.</li>
   * <li>repost - A piece of content has been reposted.</li>
   * </ul>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>activityType: "created"</span></div>
   * @property activityType
   * @type 'created' | 'modified' | 'repost'
   */

  /* containerSummary */
  osapi.jive.core.extendWithContainerSummaryProperty(this);

  /* entitySummary */
  osapi.jive.core.extendWithEntitySummaryProperty(this);

  /* modificationDate */
  /**
   * <p>The date/time that the activity was last modified</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate : "2010-10-28T18:10:06.712+0000"</span></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* user */
  /**
   * <p>The user that was logged in when the activity was created.</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * @property user
   * @type <a href="osapi.jive.core.User.html">User</a>
   */
  if(this.user) {
    this.user = new osapi.jive.core.User(this.user);
  }

};

//--------------------------------------------------------------------------------------------- osapi.jive.core.Activity

/**
 * <p>This class represents a single entry in the collection of activies contained by an 
 * <a href="osapi.jive.core.ActivityContainer.html">ActivityContainer</a>.</p>
 * <p>Browse to  <a href="osapi.jive.core.activities.html">activities</a> to learn about how to retrieve and create 
 * activities.<p> 
 * <p>An Activity represents an action that was taken on a particular content entity within the context of
 * a particular container.</p>
 * <p>The following content types are supported directly by the API:</p>
 * <ul>
 * <li><a href="osapi.jive.core.Comment.html">Comment</a></li>
 * <li><a href="osapi.jive.core.Discussion.html">Discussion</a></li>
 * <li><a href="osapi.jive.core.Document.html">Document</a></li>
 * <li><a href="osapi.jive.core.Message.html">Message</a></li>
 * <li><a href="osapi.jive.core.Post.html">Post</a></li>
 * <li><a href="osapi.jive.core.Update.html">Update</a></li>
 * </ul>
 * <p>If other content types are added to Jive by a plugin or other means, they may be returned as part of an activity,
 * but will not have first class support. They will be represented as an instance of Object with the properties
 * returned by the server added to it.</p>
 * <p>The following container types are supported directly by the API:</p>
 * <ul>
 * <li><a href="osapi.jive.core.Group.html">Group</a></li>
 * <li><a href="osapi.jive.core.Project.html">Project</a></li>
 * <li><a href="osapi.jive.core.Space.html">Space</a></li>
 * <li><a href="osapi.jive.core.User.html">User</a></li>
 * </ul>
 * <p>If other container types are added to Jive by a plugin or other means, they may be returned as part of an activity,
 * but will not have first class support. They will be represented as an instance of Object with the properties
 * returned by the server added to it.</p>
 * @class Activity
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.EntitySummaryHolder
 */
osapi.jive.core.Activity = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Activity');
  osapi.jive.extend(this, jsonResponse);

  var that = this;
  
  /* activityType */
  /**
   * <p>There are three types activities that are supported by the Jive system:</p>
   * <ul>
   * <li>created - A piece of content has been created.</li>
   * <li>modified - A piece of content has been modified.</li>
   * <li>repost - A piece of content has been reposted.</li>
   * </ul>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>activityType: "created"</span></div>
   * @property activityType
   * @type 'created' | 'modified' | 'repost'
   */

  /* creationDate */
  /**
   * <p>The date/time that the activity was created</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate : "2010-10-28T18:10:06.712+0000"</span></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* entitySummary */
  osapi.jive.core.extendWithEntitySummaryProperty(this);

  /* user */
  /**
   * <p>The user that was logged in when the activity was created.</p>
   * <p><span class='title'>Availability:</span> Always</p>
   * @property user
   * @type <a href="osapi.jive.core.User.html">User</a>
   */
  if(this.user) {
    this.user = new osapi.jive.core.User(this.user);
  }

};

//--------------------------------------------------------------------------------- osapi.jive.core.activities namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.Activity.html">Activity</a>
 * from the activity stream.<p>
 * <p>There are 3 types of activities that exist in Jive, 
 * A. global activity (activity not associated with a user), 
 * B. activity of users and 
 * C. activity of a user's connections. 
 * This class allows all 3 types to be retrieved. Additionally, 
 * <a href="osapi.jive.core.User.html">osapi.jive.core.User</a> allows you to retrieve only B. 
 * <a href="http://wiki.opensocial.org/index.php?title=Opensocial.Activity_(v0.9)">Opensocial.Activity</a> is used for 
 * creating activities.***notes: container activity, logged in user activity, logged in user's followed activity.</p>
 * @class activities
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.activities', {
  
  /*
   * Messages returned to callback functions.
   */
  messages: {
    error: {
      invalidUserId: 'Invalid userId',
      invalidGroupId: 'Invalid groupId'
    }
  },
    
  /**
   * <p>Retrieve an array of <a href="osapi.jive.core.Activity.html">Activity</a> objects.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><div style='margin-left: 2em;'><p>Fetching activities is a two step process:</p>
   *   1. The first step is to obtain a request object. This step returns an instance of <a href='http://osapi.jive.core.Request.html'>Request</a>. This is a local call. 
   *      The following are some examples:
   *   <p></p>
   *   <ul><li>Get a request object to fetch the global activity stream for the logged in user:
   *     <code class='comment'>// get the activites request object for all visible activites.</code>
   *     <code>var request = osapi.jive.core.activities.get();</code></li>
   *   <li>Return the activity objects for the user with the given ID:
   *     <code class='comment'>// get the activites request object for the given user id.</code>
   *     <code>var request = osapi.jive.core.activities.get({userId: id})</code></li>
   *   <li>Return the activity objects for the logged in user:
   *     <code class='comment'>// get the activites request object for the logged in user.</code>
   *     <code>var request = osapi.jive.core.activities.get({userId: '@viewer'})</code></li>
   *   <li>Return the first 10 activity objects from the global activity stream:
   *     <code class='comment'>// get the activites request object for the first 10 visible activites.</code>
   *     <code>var request = osapi.jive.core.activities.get({limit: 10})</code></li>
   *   </ul>
   *   2. The second step is to execute the request. The execute() method on the request sends the request to the 
   *      server. When it receives the response, it calls the callback function that was passed to it.
   *  <p></p>
   *  <code class='comment'>// execute the request</code>
   *  <code>request.execute(function(response) {</code>
   *  <code>  if(response.error) {</code>
   *  <code>    alert(response.error.message);</code>
   *  <code>  } else {</code>
   *  <code>    var activities = response.data;</code>
   *  <code>    // do something with the activities array.</code>
   *  <code>  }</code>
   *  <code>});</code></li>
   *  </div>
   * </div>
   * 
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <td><ul><li>If this parameter is omitted, 25 activities will be found.</li><li>If a non positive number is passed then an
   * error with code 400 will be passed to the callback.</li></ul></td></tr>
   * <tr><td>type</td><td>discussion |<br/>document |<br/>post |<br/>update</td><td>false</td><td>The type of Activity objects that should be returned.</td>
   * <td><ul><li>If an invalid type is passed then an error with code 400 will be passed to the callback.</li></ul></td></tr>
   * <tr><td>userId</td><td>Integer | '@viewer'</td><td>false</td><td>The ID of the User or '@viewer' for the current
   * user. In order to call this method with an ID other than '@viewer', a user ID will need to have been obtained
   * from some other object that contains it. For example, a User object retrieved through the osapi.jive.core.users.get
   * method will contain the ID of the user.</td>
   * <td><ul><li>If no userId is provided, then all activity visible to the logged in user will be found.</li>
   * <li>If a numeric userId is provided, then the activity for the user specified by the userId will be found.</li>
   * <li>If '@viewer' is provided, then the activity for the currently logged in user will be found</li>
   * <li>If a numeric id is provided that can not be found in the database, then an error object with code set to 404
   * will be passed to the callback.</li><li>If a non-numeric id that is not '@viewer' is passed, then an error object with message set
   * to 'Invalid userId' will be passed to the callback.</li></ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} 
   * A request that, when executed, will retrieve the collection of Activities from the server and pass them to the
   * callback function.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    var params = {
      after: options.after,
      before: options.before,
      limit: options.limit,
      type: options.type
    };
    return osapi.jive.core.activities._getActivity(options.userId, options.groupId, params);
  },

  /**
   * <p>Builds a URI that may be used with activity action links, that works similar to
   * gadgets.views.requestNavigateTo(). When this link is clicked, the app may call
   * gadgets.views.getParams() to retrieve these values.</p>
   * <p>This method is useful for applications that make use of
   * <a href="http://wiki.opensocial.org/index.php?title=Osapi.activities_%28v0.9%29#osapi.activities.create">osapi.activities.create()</a>
   * to publish action items to the Jive Action Queue, but wish to provide a
   * link back to the application in a manner similar to a deferred call to
   * <a href="http://wiki.opensocial.org/index.php?title=Gadgets.views_%28v0.9%29#gadgets.views.requestNavigateTo">gadget.views.requestNavigateTo()</a>.
   * Application developers should note that the this deep link may be opened in the
   * context of a Jive user that is different than the current user. This situation
   * will require that user to install the application before they can fully utilize
   * the link.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'>
   *   <ul><li>Build a link that opens the canvas view of the application:
   *     <code class='comment'>// link to the canvas view.</code>
   *     <code>actionLink.url = osapi.jive.core.activities.createDeepLink('canvas');</code></li>
   *   <li>Build a link that opens a custom canvas sub-view of the application:
   *     <code class='comment'>// link to the canvas.detail sub-view.</code>
   *     <code>actionLink.url = osapi.jive.core.activities.createDeepLink('canvas.detail');</code></li>
   *   <li>Build a link that opens a custom canvas sub-view of the application, with passed parameters:
   *     <code class='comment'>// link to the canvas.detail sub-view with parameters.</code>
   *     <code>actionLink.url = osapi.jive.core.activities.createDeepLink('canvas.detail',</code>
   *     <code>  {"id":"12345","context":"example.pdf"});</code></li></ul>
   * </div>
   *
   * @method createDeepLink
   * @param view {String} The view to navigate to
   * @param opt_params {Object} Parameters to pass to the gadget after it has been navigated to on the surface.
   * @return {String} A URI capturing a view and its parameters
   * @static
   */
  createDeepLink: function(view, opt_params) {
    var uri = "jive:app://" + view;
    if (opt_params) {
      uri += "?params=" + encodeURIComponent(JSON.stringify(opt_params));
    }
    return uri;
  },

  /**
   * Retrieve activity records for the current user or the user with the given id.
   * 
   * @method _getActivity
   * @param userId {Integer|String} Either the id of the desired user of '@viewer' for the logged in user.
   * @private
   * @static
   */
  _getActivity: function(userId, groupId, params) {
    params = params || {};
    var url;
    if(!userId) {
      url = '/activity';
    } else if(typeof userId === 'number') {
      url = '/users/' + userId + '/activity';
    } else if(userId === '@viewer') {
      if(groupId) {
        switch(groupId) {
        case '@followed':
          url = '/my/followed/activity';
          break;
        default:
          return osapi.jive.core._buildRequestWithStaticErrorResponse(
            osapi.jive.core.activities.messages.error.invalidUserId + ': ' + userId
          );
        }
      } else {
        url = '/my/activity';
      }
    } else {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
          osapi.jive.core.activities.messages.error.invalidUserId + ': ' + userId
      );
    }
    osapi.jive.extend(params, {
      className: 'ActivityContainer',
      findUrl: url,
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  }

});


/********** core/Attachment.js **********/

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
/**
 * <p class="definition">Describes a piece of additional content that has been added to a document, message, or post.</p>
 * <p>Contains metadata describing the characteristics of a (typically binary) attachment that has been added to a
 * <a href="osapi.jive.core.Document.html>Document</a>, <a href="osapi.jive.core.Message.html">Message</a>,
 * or <a href="osapi.jive.core.Post.html>Post</a>.</p>
 * @class Attachment
 * @namespace osapi.jive.core
 */
osapi.jive.core.Attachment = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Attachment');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  //--------------------------------------------------------------------------------------------------------- Properties

  /**
   * <p>The MIME type of the content for this attachment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>contentType: "image/png"</code></div>
   * @property contentType
   * @type String
   */

  /**
   * <p>An identifier that is assigned to the object by the Jive system.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>id: 1001</code></div>
   * @property id
   * @type Integer
   */

  /**
   * <p>The name (often a filename) for the content of this attachment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "example.png"</code></div>
   * @property name
   * @type String
   */

  /**
  * <p>The URL to retrieve the content of this attachment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>ref: "http://example.com/photos/example.png"</code></div>
  * @property ref
  * @type URL
   */

  /**
   * <p>The size (in bytes) of the content of this attachment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>size: 12345</code></div>
   * @property size
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  this.destroy = function() {
    return osapi.jive.core.destroyObject({
      destroyUrl: osapi.jive.core._getRelativeUrl(that.ref)
    });
  }

};

//------------------------------------------------------------------------------------- osapi.jive.core.images namespace

/**
 * <p class="definition">This static class allows for the upload of images to Jive.</p>
 * @class attachments
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.attachments', {

  /**
   * <p>Request that an attachment be uploaded to Jive. This function will cause the container to pop up a file
   * dialog with which the user can select the attachment they wish to upload.</p>
   * @method requestAttachmentUpload
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  requestAttachmentUpload: function(callback, options) {
    options = options || {};
    //console.log('---> Executing: requestAttachmentUpload');
    var token = shindig.auth.getSecurityToken();
    osapi.jive.extend(options, {
      actionUrl: osapi.jive.core._constructUploadActionUrl(undefined, 'attachments'),
      core: true
    });
    var rpcCallback = function(item) {
      console.log('---> Received callback');
      console.log(item);
      if(typeof callback === 'function') {
        if(item.code) {
          callback(osapi.jive.core._createErrorResponse(item));
        } else {
          if(item.ref) {
            item.ref = osapi.jive.core._getRelativeUrl(item.ref);
          }
          callback(new osapi.jive.core.Image(item));
        }
      }
    };
    gadgets.rpc.call( null, "request_core_api_upload", rpcCallback, null, options, token);
  }
});


/********** core/Blog.js **********/

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
/**
 * <p class="definition">A Blog is a collection of <a href="osapi.jive.core.Post.html">blog posts</a>.</p>
 * <p>A Blog object provides access to information about the blog and the ability to retrieve the blog posts contained
 * within the blog.</p>
 * <p>Blog objects can either be full or summarized. When a list of Blogs is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full user from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Blog object from the server by executing it.</p>
 * @class Blog
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Blog = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Blog');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* creationDate */
  /**
   * <p>The date/time that the blog was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* description */
  /**
   * <p>The "Description" of the blog set by the blog owner.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>description: "A blog about daily happenings"</code></div>
   * @property description
   * @type String
   */

  /* displayName */
  /**
   * <p>The URL extention that is used to access the blog. This is the "Blog Address" that the blog owner set when
   * the blog was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>displayName: "my-blog"</code></div>
   * @property displayName
   * @type String
   */

  /* modificationDate */
  /**
   * <p>The date/time that the blog was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* name */
  /**
   * <p>The name of the blog. This is the "Blog Name" that the blog owner set when the blog was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "My Blog"</code></div>
   * @property name
   * @type String
   */

  /* viewCount */
  /**
   * <p>The number of times the blog has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */
  
  //------------------------------------------------------------------------------------------------------------ Methods
  
  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Blog');

  /* owner */
  /**
   * <p>Retrieve the <a href="osapi.jive.core.User.html">user</a> that owns the blog.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the blog owner</code>
   *   <code>var request = blog.owner.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method owner.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return the user that owns the blog.
   */

  /* parent */
  /**
   * <p>Get the parent of the blog. In this case, the parent is a synonym for owner()</p> 
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the blog parent</code>
   *   <code>var request = blog.parent.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return the parent of the blog.
   */

  /* post */
  /**
   * <p>Create a blog post for this blog.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. Only available when the logged in user has 
   * the right to create a post on the blog.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for creating a blog post</code>
   *   <code>var postDetails = {subject: "My blog post",</code>
   *   <code>                   html: "This is the content"};</code>
   *   <code>var post = blog.posts.create(postDetails);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>post.execute(function(response) { ... });</code>
   * </div>
   * @method posts.create
   * @param content {Object} The following are valid content elements:
   * <p><table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject for the new blog post.</td></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content of the new blog post.</td></tr>
   * </table></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will create a new <a href="osapi.jive.core.Post.html">post</a> on the blog.
   */
  /**
   * <p>Get a list of posts in the blog.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the</code>
   *   <code class='comment'>// latest 5 posts in the blog</code>
   *   <code>var request = blog.posts.get({limit:5});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method posts.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class="wider">Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of blog posts to return.</td><td>
   * <ul>
   * <li>If there are fewer blog posts available in the given time period, then fewer blog posts will be returned then
   * the limit.</li>
   * <li>If limit is not provided then a maximum of 25 elementss will be returned.</li>
   * </ul>
   * </td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the posts in the container using the
   * given query.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return an array of <a href="osapi.jive.core.Post.html">posts</a> that are in the blog.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

};

//-------------------------------------------------------------------------------------- osapi.jive.core.blogs namespace

/**
 * <p class="definition">This static class allows you to retrieve a <a href="osapi.jive.core.Blog.html">Blog</a> by ID
 * or an array of Blogs in Jive for which you have access.</p>
 * <p>Blogs can most easily be retrieved from their parent container objects:</p>
 * <ul>
 * <li>Groups: <a href="osapi.jive.core.Group.html#method_blog.get">group.blog.get</a>
 * <li>Projects: <a href="osapi.jive.core.Project.html#method_blog.get">project.blog.get</a>
 * <li>Spaces: <a href="osapi.jive.core.Space.html#method_blog.get">space.blog.get</a>
 * <li>Users: <a href="osapi.jive.core.User.html#method_blog.get">user.blog.get</a>
 * </ul>
 * <p>The functions in this static class, however, provided a means to retrieve a blog directly by its ID or a
 * collection of blogs</p>
 * @class blogs
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.blogs', {

  messages: {
    error: {
      invalidBlogId: 'Invalid blog id'
    }
  },

  /**
   * <p>Retrieve a blog object or a collection of blog objects.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting the blog</code>
   *   <code>var request = osapi.jive.core.blogs.get({id: 1001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired blog</td><td><ul>
   * <li>If no id is provided, all blogs will be returned</li>
   * </ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Blog objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>This option is only valid if an 'id' is not provided</li>
   * <li>If this parameter is omitted, 25 blogs will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return a Blog if an id was provided or an array of Blogs otherwise.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    if(options.id) {
      return osapi.jive.core.blogs._getById(options.id);
    } else {
      var params = {
        after: options.after,
        before: options.before,
        limit: options.limit
      };
      return osapi.jive.core.blogs._getAll(params);
    }
  },

  /**
   * Get all blogs
   * @param params {Object} Parameter object containing the values of the request parameters to be sent.
   * @static
   * @private
   */
  _getAll: function(params) {
    osapi.jive.extend(params, {
      className: 'Blog',
      findUrl: '/blogs/',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  /**
   * Find a blog via its ID
   * 
   * @method _getById
   * @param blogId {Integer} ID of the blog to look up
   * @static
   * @private
   */
  _getById: function(id) {
    return osapi.jive.core.getObject({
      className:'Blog', 
      findUrl:'/blogs/' + id, 
      jsonPath:'/'
    });
  }

});


/********** core/Comment.js **********/

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
/**
 * <p class="definition">Represents a comment on content within Jive. Blog posts, documents, messages and updates are
 * <a href="osapi.jive.core.Commentable.html">commentable</a> in Jive.</p>
 * <p>Comment objects can either be full or summarized. When a list of Comments is returned from the server, each object
 * in the list will be a summarized version. It order to get the full comment from a summarized object, use the get 
 * method on the summarized object. This will provide a Request object that can then be used to obtain the full version
 * of the Comment object from the server by executing it.</p>
 * @class Comment
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.ContentHolder
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Likable
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Comment = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Comment');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  osapi.jive.core.extendWithResourcesMethods(this);

  //---------------------------------------------------------------------------------------------------------- Propeties

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* content */
  /* see osapi.jive.impl.ContentHolder */

  /* creationDate */
  /**
   * <p>The date/time that the comment was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* likeCount */
  /**
   * <p>The number of people who have indicated that they like the comment.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>likeCount: 5</code></div>
   * @property likeCount
   * @type Integer
   */

  /* modificationDate */
  /**
   * <p>The date/time that the comment was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* replyCount */
  /**
   * <p>The number of replies that the comment has recieved.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>replyCount: 3</code></div>
   * @property replyCount
   * @type Integer
   */

  /* status */
  /**
   * <p>Indicates if the content is draft or published.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</code></div>
   * @property status
   * @type 'draft' | 'published'
   */

  //------------------------------------------------------------------------------------------------------------ Methods


  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Comment');
  
  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Comment');

  /* like/likes */
  osapi.jive.core.extendWithLikeMethods(this);

  /* parent */
  /**
   * <p>Remove the comment that is the parent of this comment</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method will only be defined if the logged in user has
   * rights to remove the parent comment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for deleting the comment's parent</code>
   *   <code>var request = comment.parent.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will remove the parent comment.
   */
  /**
   * <p>Retrieve the parent comment of this comment</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the comment's parent</code>
   *   <code>var request = comment.parent.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will retrieve the parent of this comment. The retrieved object can be of any
   * <a href="osapi.jive.core.Commentable.html">Commentable</a> types.
   */

  /* replies */
  /**
   * <p>Create a reply to this comment.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method will only be defined if the logged in user has
   * the rights to create a reply to this comment.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for creating a reply</code>
   *   <code>var request = comment.replies.create({html: 'my comment'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method replies.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new comment</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new comment.
   */
  /**
   * <p>Retrieve a list of replies to this comment..</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting replies</code>
   *   <code>var request = comment.replies.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
* @method replies.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the list of comments that are replies to this comment.
   */

};

//----------------------------------------------------------------------------------- osapi.jive.core.comments namespace

osapi.jive.namespace('core.comments', {
  
  messages: {
    error: {
      invalidComment: 'Must provide an html element'
    }
  }

});
  


/********** core/Communication.js **********/

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
/**
 * <p class="definition">A Communication is a message that is generated by Jive that provides a user with important
 * information that should be responded to.</p>
 * @class Communication
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.ContainerSummaryHolder
 * @uses osapi.jive.impl.EntitySummaryHolder
 * @uses osapi.jive.impl.UserHolder
 */
osapi.jive.core.Communication = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Communication', jsonResponse);

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  //---------------------------------------------------------------------------------------------------------- Propeties

  /* activities */
  /**
   * <p>This a collection of activities that are related to the given communication.</p>
   * @property activities
   * @type <a href="osapi.jive.core.Activity.html">Activity</a>[]
   */
  osapi.jive.core.extendWithActivitiesProperty(this);

  /* containerSummary */
  osapi.jive.core.extendWithContainerSummaryProperty(this);

  /* entitySummary */
  osapi.jive.core.extendWithEntitySummaryProperty(this);

  /*user */
  osapi.jive.core.extendWithUserProperty(this, 'user');


  //------------------------------------------------------------------------------------------------------------ Methods

  //console.log('---> osapi.jive.core.Communication constructed', this);
};

//----------------------------------------------------------------------------- osapi.jive.core.communications namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.Communication.html">
 * Communication</a> objects.<p>
 * @class communications
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.communications', {

  /**
   * <p>Retrieve all communication objects.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting communications</code>
   *   <code>var request = osapi.jive.core.communications.getAll();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method getAll
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   *   <tr>
   *     <th>Name</th>
   *     <th class='wider'>Type</th>
   *     <th>Required</th>
   *     <th>Description</th>
   *     <th>Behavior</th>
   *   </tr>
   *   <tr>
   *     <td>limit</td>
   *     <td>Integer</td>
   *     <td>false</td>
   *     <td>The maximum number of Comunication objects that should be found.</td>
   *     <td>
   *       <ul>
   *         <li>This option is only valid if an 'id' is not provided</li>
   *         <li>If this parameter is omitted, 25 blogs will be found.</li>
   *         <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   *       </ul>
   *     </td>
   *   </tr>
   *   <tr>
   *     <td>onlyUnread</td>
   *     <td>Boolean</td>
   *     <td>false</td>
   *     <td>If true, only return communications that have not been read. If false, return all communications.</td>
   *     <td></td>
   *   </tr>
   *   <tr>
   *     <td>markAllRead</td>
   *     <td>Boolean</td>
   *     <td>false</td>
   *     <td>Cause all outstanding communications to be marked as read.</td>
   *     <td></td>
   *   </tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>}
   *  A request object that, when executed, will return an array of Communication objects.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  getAll: function(options) {
    options = options || {};
    var params = {
      before: options.before,
      limit: options.limit,
      onlyUnread: options.onlyUnread,
      markAllRead: options.markAllRead
    };
    osapi.jive.extend(params, {
      className: 'Communication',
      findUrl: '/communications/',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  }

});

/********** core/DirectMessage.js **********/

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
/**
 * <p class="definition">A private message between two or more users</p>
 * @class DirectMessage
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.ContainerSummaryHolder
 * @uses osapi.jive.impl.EntitySummaryHolder
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.ParticipantsHolder
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Summarizable
 * @uses osapi.jive.impl.Trackable
 */
osapi.jive.core.DirectMessage = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.DirectMessage', jsonResponse);

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      },
      track: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/tracks'
      },
      tracks: {
        allowed: ['DELETE', 'GET'],
        ref: this.resources.self.ref + '/tracks/2001'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* containerSummary */
  osapi.jive.core.extendWithContainerSummaryProperty(this);

  /* entitySummary */
  osapi.jive.core.extendWithEntitySummaryProperty(this);

  /* participants */
  osapi.jive.core.extendWithParticipantsProperty(this);

  //------------------------------------------------------------------------------------------------------------ Methods

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'DirectMessage');

  /* read/unread */
  /* see osapi.jive.impl.Readable */

  //console.log('---> osapi.jive.core.DirectMessage constructed', this);
};

//------------------------------------------------------------------------------ osapi.jive.core.directmessage namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.DirectMessage.html">
 * DirectMessage</a> objects.<p>
 * @class directmessages
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.directmessages', {

  /**
   * <p>Retrieve one direct message by it's ID or all direct messages</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting shares</code>
   *   <code>var request = osapi.jive.core.directmessages.get({id: 1001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   *   <tr>
   *     <th>Name</th>
   *     <th class='wider'>Type</th>
   *     <th>Required</th>
   *     <th>Description</th>
   *     <th>Behavior</th>
   *   </tr>
   *   <tr>
   *     <td>id</td>
   *     <td>Integer</td>
   *     <td>false</td>
   *     <td>The ID of the desired direct message</td>
   *     <td></td>
   *   </tr>
   *   <tr>
   *     <td>limit</td>
   *     <td>Integer</td>
   *     <td>false</td>
   *     <td>The maximum number of DirectMessage objects that should be found.</td>
   *     <td>
   *       <ul>
   *         <li>This option is only valid if an 'id' is not provided</li>
   *         <li>If this parameter is omitted, 25 direct messages will be found.</li>
   *         <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   *       </ul>
   *     </td>
   *   </tr>
   * </table>
   */
  get: function(options) {
    options = options || {};
    var params = {
      before: options.before,
      limit: options.limit
    };
    if(options.id) {
      return osapi.jive.core.directmessages._getById(options.id);
    } else {
      return osapi.jive.core.directmessages._getAll(params);
    }
  },

  _getAll: function(params) {
    osapi.jive.extend(params, {
      className: 'Communication',
      findUrl: '/communications/dms',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  _getById: function(id) {
    return osapi.jive.core.getObject({
      className:'DirectMessage',
      findUrl:'/dms/' + id,
      jsonPath:'/'
    });
  },

  /**
   * <p>Create a new DirectMessage.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for creating the direct message</code>
   *   <code>var request = osapi.jive.core.directmessages.create({html: 'hello world' participant: ['/user/2001']});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   *   <tr>
   *     <th>Name</th>
   *     <th class='wider'>Type</th>
   *     <th>Required</th>
   *     <th>Description</th>
   *     <th>Behavior</th>
   *   </tr>
   *   <tr>
   *     <td>draft</td>
   *     <td>Boolean</td>
   *     <td>false</td>
   *     <td>Indicates whether the direct message will be created in draft mode or not.</td>
   *     <td>The default value is 'false'</td>
   *   </tr>
   *   <tr>
   *     <td>html</td>
   *     <td>String</td>
   *     <td>true</td>
   *     <td>The content of the direct message.</td>
   *     <td></td>
   *   </tr>
   *   <tr>
   *     <td>participant</td>
   *     <td>String[]</td>
   *     <td>true</td>
   *     <td>An array of users to which the direct message should be sent.</td>
   *     <td></td>
   *   </tr>
   * </table>
   */
  create: function(options) {
    options = options || {};
    var params = {
      className: 'DirectMessage',
      createUrl: '/communications/dms/',
      params: {
        html: options.html,
        draft: options.draft,
        participant : options.participant ? options.participant : []
      }
    };
    return osapi.jive.core.createObject(params);
  }

});

/********** core/Discussion.js **********/

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
/**
 * <p class="definition">A discussion is a communication thread between one or more 
 * <a href="osapi.jive.core.User.html">users</a> in the Jive system. A discussion is comprised of a collection of on or
 * more <a href="osapi.jive.core.Message.html">messages</a>.</p>
 * <p>The first message in the discussion is called the "root" message and can be retrieved from the messages.root
 * property. All other messages are retrieved using messages.get()</p>
 * <p>Discussion objects can either be full or summarized. When a list of Discussions is returned from the server, each
 * object in the list will be a summarized version. It order to get the full user from a summarized object, use the get
 * method on the summarized object. This will provide a Request object that can then be used to obtain the full version
 * of the Discussion object from the server by executing it.</p>
 * @class Discussion
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Sharable
 * @uses osapi.jive.impl.Trackable
 */
osapi.jive.core.Discussion = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Discussion');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

/**
 * Add a temporary links.
 * TODO: Remove these once the server provides support
 */
if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
  this.resources = osapi.jive.extend(this.resources, {
    read: {
      allowed: ['DELETE', 'POST'],
      ref: this.resources.self.ref + '/read'
    },
    share: {
      allowed: ['POST'],
      ref: this.resources.self.ref + '/share'
    },
    track: {
      allowed: ['POST'],
      ref: this.resources.self.ref + '/tracks'
    },
    tracks: {
      allowed: ['DELETE', 'GET'],
      ref: this.resources.self.ref + '/tracks/2001'
    }
  });
};

  osapi.jive.core.extendWithResourcesMethods(this);

  //---------------------------------------------------------------------------------------------------------- Propeties

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* creationDate */
  /**
   * <p>The date/time that the discussion was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* message */
  /**
   * <p>Retrieve the root Message for the Discussion. This is a local method</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * @property messages.root
   * @type <a href="osapi.jive.core.Message.html">Message</a>
   */
  this.messages = this.messages || {};
  if(this.message) {
    this.messages.root = new osapi.jive.core.Message(that.message);
  };

  /* modificationDate */
  /**
   * <p>The date/time that the discussion was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* question */
  /**
   * <p>Has the discussion been marked as a question?</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This property will only be defined if
   * its value is true. Undefined should be taken as false.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>question: true</code></div>
   * @property question
   * @type Boolean
   */

  /* status */
  /**
   * <p>Indicates if the discussion is draft or published. Draft messages are only visible to authors and reviewers.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</span></div>
   * @property status
   * @type 'draft' | 'published'
   */

  /* viewCount */
  /**
   * <p>The number of times the discussion has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* answer */
  /**
   * <p>Destroy the message that has been marked as the answer to this discussion</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method is defined only if the logged
   * in user is authorized to remove answer message.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to delete the answer message.</code>
   *   <code>var request = discussion.answer.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method answer.destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, will remove
   * the answer to the discussion.
   */
  /**
   * <p>Get the message that has been marked as the answer to this discussion</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method is defined only if the logged
   * in user is authorized to get the answer message.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to get the answer message.</code>
   *   <code>var request = discussion.answer.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method answer.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that, when executed, will return
   * the answer to this discussion.
   */

  /* container */
  /**
   * <p>Retrieve the container that is holding the discussion. This includes the following in a standard Jive
   * instance:
   * <ul>
   * <li><a href="osapi.jive.core.Group.html">osapi.jive.core.Group</a></li>
   * <li><a href="osapi.jive.core.Project.html">osapi.jive.core.Project</a></li>
   * <li><a href="osapi.jive.core.Space.html">osapi.jive.core.Space</a></li>
   * <li><a href="osapi.jive.core.User.html">osapi.jive.core.User</a></li>
   * </ul></p>
   * <p><span class='title'>Availability:</span> Full object.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the container</code>
   *   <code>var request = discussion.container.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var container = response.data;</code>
   *   <code>    if(container instanceof osapi.jive.core.Group) {</code>
   *   <code class='comment'>      // do something with the Group.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.Project) {</code>
   *   <code class='comment'>      // do something with the Project.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.Space) {</code>
   *   <code class='comment'>      // do something with the Space.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.User) {</code>
   *   <code class='comment'>      // do something with the User.</code>
   *   <code>    }</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method container.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the container for this discussion. When the request is executed, an object of one of the
   * above types will be returned.
   */

  /* destroy */
  /**
   * <p>Request that the server remove the discussion.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method is defined only if the logged in user is
   * authorized to remove the discussion.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to delete the discussion.</code>
   *   <code>var request = discussion.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will remove the discussion from the server.
   */
  osapi.jive.core.extendWithMutableMethods(this, 'Discussion');

  /* following */
  osapi.jive.core.extendWithFollowMethods(this);

  /* messages */
  /**
   * <p>Create a new <a href="osapi.jive.core.Message.html">message</a> in this discussion.<p>
   * <p><span class='title'>Availability:</span> Full object. This method is only available if the logged in user has the permissions
   * to create a message on the discussion</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object to create a message.</code>
   *   <code>var message = {subject: 'my subject', html: 'my message'};</code>
   *   <code>var request = discussion.message.create(message);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method messages.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion message</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new message.
   */
  /**
   * <p>Get the messages other than the root messages that are in the discussion.</p>
   * <p><span class='title'>Availability:</span> Full object. This method is only available if the logged in user has the permissions
   * to get the messages for a discussion.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for retrieving the non-root messages</code>
   *   <code>var request = discussion.messages.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method messages.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>anchor</td><td>URI</a></td><td>false</td>
   * <td>Optional URI for a message to anchor at. Specifying a anchor will try to return the page containing the
   * anchor.</td>
   * <td><ul>
   * <li>If the anchor could not be found then the first page of messages will be returned.</li>
   * </ul></td></tr>
   * <tr><td>excludeReplies</td><td>Boolean</td><td>false</td><td>If true, then only top level messages will be
   * returned.</td><td><ul><li>Default value is false</li></ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of messages that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 messages will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * <tr><td>sort</td><td>'chronological' | 'threaded'</td><td>false</td><td>Specifies the order in which the messages
   * should be returned</td><td><ul><li>Default value is 'chronological'</li></ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the non-root messages for this discussion. When the request is executed an array of 
   * <a href="osapi.jive.core.Message.html">Message</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */
  
  /* read/unread */
  /* see osapi.jive.impl.Readable */

  /* share */
  /* see osapi.jive.impl.Sharable */

  /* track */
  /* see osapi.jive.impl.Trackable */

};

//-------------------------------------------------------------------------------- osapi.jive.core.discussions namespace

/**
 * <p class="definition">This static class allows you to retrieve and create
 * <a href="osapi.jive.core.Discussion.html">discussions</a> in Jive.</p>
 * @class discussions
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.discussions', {
  
  messages: {
    error: {
      invalidDiscussionId: 'Invalid discussion id',
      invalidUserId: 'Invalid user id'
    }
  },
    
  /**
   * <p>Retrieve a <a href="osapi.jive.core.Discussion.html">discussion</a> by its id.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for a specific discussion.</code>
   *   <code>var request = osapi.jive.core.discussions.get({id: 2001);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the requested discussion.
   * @static
   */
  get: function(options) {
    options = options || {};
    if(!options.id) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
          osapi.jive.core.discussions.messages.error.invalidDiscussionId + ": " + options.id
      );
    }
    return osapi.jive.core.discussions._getDiscussionById(options.id);
  },
  
  /**
   * <p>Retrieve discussion record for the given discussion id.</p>
   * 
   * @method _getDiscussionById
   * @namespace osapi.jive.core.discussions
   * @param id {Integer} The id of the desired discussion.
   * @private
   * @static
   */
   _getDiscussionById: function(id) {
    return osapi.jive.core.getObject({
      className: 'Discussion', 
      findUrl: '/discussions/' + id, 
      jsonPath: '/'
    });
  }

});

osapi.jive.core.discussions['private'] = {
  /* private.create */
  /**
   * <p>Create a new private discussion.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for creating the private discussion</code>
   *   <code>var discussion = {userId: '@viewer',</code>
   *   <code>                  subject: 'my discussion',</code>
   *   <code>                  html: 'discussion content',</code>
   *   <code>                  userURI: ['/users/2002']}</code>
   *   <code>var request = osapi.jive.core.discussions.private.create(discussion);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method private.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td><td></td></tr>
   * <tr><td>question</td><td>Boolean</td><td>false</td><td>Should this discussion be considered a question?</td>
   * <td><ul><li>Default value is false</li></ul></td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td><td></td></tr>
   * <tr><td>userId</td><td>'@viewer'</td><td>true</td><td>The userID for which to create the discussion</td>
   * <td><ul><li>This method is only valid for the currently logged in user. Thus, userId must be '@viewer'</li></ul>
   * </td></tr>
   * <tr><td>userURI</td><td>URI[]</td><td>true</td><td>An array of URIs for user who will participate in the
   * discussion.</td><td><ul><li>User URIs are of the form '/users/id'</li></ul></td></tr>
   * <tr><td>attachmentURIs</td><td>URI[]</td><td>false</td><td>An array of URIs for binary attachments that
   * will be added to the discussion.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a new discussion.
   * @static
   */
  create: function(options) {
    var userId = options.userId;
    if(userId !== '@viewer') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.discussions.messages.error.invalidUserId + ': ' + userId
      );
    }
    var params = {
      className: 'Discussion',
      createUrl: '/my/private/discussions',
      params: {
        html: options.html,
        question: options.question,
        subject: options.subject,
        userURI: options.userURI,
        attachmentURIs : options.attachmentURIs ? options.attachmentURIs : []
      }
    };
    return osapi.jive.core.createObject(params);
  },

  /* private.get */
  /**
   * <p>Allows access to the logged in user's private <a href="osapi.jive.core.Discussion.html">discussions</a>.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the private discussions</code>
   *   <code>var request = osapi.jive.core.discussions.private.get({userId: '@viewer'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method private.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of discussions to return. If there are fewer
   * discussions available in the given time period, then fewer discussions will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the discussions in the container using the
   * given query.</td></tr>
   * <tr><td>userId</td><td>'@viewer'</td><td>true</td><td>This method is only valid for the currently logged in user. Thus, userId must be
   * '@viewer'</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the requested discussions.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    var userId = options.userId;
    if(userId !== '@viewer') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.discussions.messages.error.invalidUserId + ': ' + userId
      );
    }
    var params = {
      after: options.after,
      before: options.before,
      className: 'Discussion',
      findUrl: '/my/private/discussions',
      jsonPath: '/data',
      limit: options.limit,
      offset: options.offset,
      q: options.query
    };
    return osapi.jive.core.getCollection(params);
  }
};


/********** core/Document.js **********/

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
/**
 * <p class="definition">Represents a <a href="osapi.jive.core.documents.html">document</a> in Jive.</p>
 * @class Document
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AttachmentsHolder
 * @uses osapi.jive.impl.AttachmentUploadable
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.Commentable
 * @uses osapi.jive.impl.ContentHolder
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.ImageHolder
 * @uses osapi.jive.impl.Likable
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Sharable
 * @uses osapi.jive.impl.Summarizable
 * @uses osapi.jive.impl.Trackable
 */
osapi.jive.core.Document = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Document');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      },
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      },
      track: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/tracks'
      },
      tracks: {
        allowed: ['DELETE', 'GET'],
        ref: this.resources.self.ref + '/tracks/2001'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* attachments */
  osapi.jive.core.extendWithAttachmentsProperty(this);

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* content */
  /**
   * <p>Info about binary document content</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This property is only defined if the document has binary
   * content.</p>
   * @property content.binary
   * @type <a href="">Binary</a>
   */
  if(this.content && this.content.binary) {
    this.content.binary = new osapi.jive.core.documents.Binary(this.content.binary);
  }

  /* creationDate */
  /**
   * <p>The date/time that the document was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* likeCount */
  /**
   * <p>The number of people who have indicated that they like the document.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>likeCount: 5</code></div>
   * @property likeCount
   * @type Integer
   */

  /* modifictionDate */
  /**
   * <p>The date/time that the document was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* replyCount */
  /**
   * <p>The number of replies that the document has recieved.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>replyCount: 3</code></div>
   * @property replyCount
   * @type Integer
   */

  /* status */
  /**
   * <p>Indicates if the content is draft or published.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</code></div>
   * @property status
   * @type 'draft' | 'published'
   */

  /* subject */
  /**
   * <p>The subject of the document.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>subject: "My document"</span></div>
   * @property subject
   * @type String
   */

  /* version */
  /**
   * <p>The version of the document.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>version: 5"</span></div>
   * @property version
   * @type Integer
   */

  /* viewCount */
  /**
   * <p>The number of times the document has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* attach image */
  /**
   * <p>Request that an image be uploaded and attached to the document. This function will cause the container to pop up
   * a file dialog with which the user can select the image they wish to upload.</p>
   * @method requestAttachImage
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'images', '/documents' + that.id, 'documents', that.id),
    methodName: 'requestAttachImage'
  });

  /* comments */
  /* see osapi.jive.core.Commentable */

  /* container */
  /**
   * <p>Retrieve the container that is holding the document. This includes the following in a standard Jive
   * instance:
   * <ul>
   * <li><a href="osapi.jive.core.Group.html">osapi.jive.core.Group</a></li>
   * <li><a href="osapi.jive.core.Project.html">osapi.jive.core.Project</a></li>
   * <li><a href="osapi.jive.core.Space.html">osapi.jive.core.Space</a></li>
   * <li><a href="osapi.jive.core.User.html">osapi.jive.core.User</a></li>
   * </ul></p>
   * <p><span class='title'>Availability:</span> Full object.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the container</code>
   *   <code>var request = document.container.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var container = response.data;</code>
   *   <code>    if(container instanceof osapi.jive.core.Group) {</code>
   *   <code class='comment'>      // do something with the Group.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.Project) {</code>
   *   <code class='comment'>      // do something with the Project.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.Space) {</code>
   *   <code class='comment'>      // do something with the Space.</code>
   *   <code>    }</code>
   *   <code>    if(container instanceof osapi.jive.core.User) {</code>
   *   <code class='comment'>      // do something with the User.</code>
   *   <code>    }</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method container.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the container for this document. When the request is executed, an object of one of the
   * above types will be returned.
   */

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Document');

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Document');

  /* like/likes */
  osapi.jive.core.extendWithLikeMethods(this);

  /* read/unread */
  /* see osapi.jive.impl.Readable */

  /* requestAttachmentUpload */
  // TODO: Don't synthesize the attachment url once it is provided by the server.
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'attachments'), 
    methodName: 'requestAttachmentUpload'
  });

  /* requestReplaceBinaryBody */
  /**
   * <p>Request that a new binary body be uploaded to the document. This function will cause the container to pop up a
   * file dialog with which the user can select the document they wish to upload.</p>
   * @method requestReplaceBinaryBody
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'binaryBody'), 
    methodName: 'requestReplaceBinaryBody'
  });

  /* share */
  /* see osapi.jive.impl.Sharable */

  /* track */
  /* see osapi.jive.impl.Trackable */

};

//---------------------------------------------------------------------------------- osapi.jive.core.documents namespace

/**
 * <p class="definition">This static class allows you to retrieve
 * <a href="osapi.jive.core.Document.html">documents</a> from Jive.</p>
 * @class documents
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.documents', {

  messages: {
    error: {
      invalidDocumentId: 'Invalid document id',
      invalidUserId: 'Invalid user id'
    }
  },
    
  /**
   * <p>Retrieve a <a href="osapi.jive.core.Document.html">document</a> by its id.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for a specific document.</code>
   *   <code>var request = osapi.jive.core.documents.get({id: 2001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired document</td></tr>
   * <tr><td>version</td><td>Integer</td><td>false</td><td>The desired version of the document. If not provided, the
   * latest version of the document will be returned</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the requested document.
   * @static
   */
  get: function(options) {
    options = options || {};
    if(!options.id) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.documents.messages.error.invalidDocumentId + ": " + options.id
      );
    }
    return osapi.jive.core.documents._getDocumentById(options);
  },

  /**
   * <p>Retrieve a collection of <a href="osapi.jive.core.Document.html">document</a> versions by its id.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for the first 3 versions of a specific document.</code>
   *   <code>var request = osapi.jive.core.documents.getVersions({id: 2001, limit: 3});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method getVersions
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired document</td><td></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of versions that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 versions will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * <tr><td>offset</td><td>Integer</td><td>false</td><td>The number of results which should be skipped in the returned
   * collection. For instance, if the first 25 results have already been retrieved then results after the 25th result
   * can be retrieved by specifying an offset of 25.</td><td><ul><li>Default value is 0</li><li>The minimum value for
   * the offset is 0, specifying anything less than 0 for the offset will result in an error.</li></ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the requested document.
   * @static
   */
  getVersions: function(options) {
    options = options || {};
    if(!options.id) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.documents.messages.error.invalidDocumentId + ": " + options.id
      );
    }
    return osapi.jive.core.documents._getDocumentRange(options);
  },

  /**
   * Retrieve document record for the given document id.
   * 
   * @method _getDocumentById
   * @param options.id {Integer} The id of the desired document.
   * @private
   * @static
   */
  _getDocumentById: function(options) {
    var findUrl = '/documents/' + options.id;
    if(options.version) {
      findUrl += '/versions/' + options.version;
    }
    return osapi.jive.core.getObject({
      className: 'Document', 
      findUrl: findUrl, 
      jsonPath: '/'
    });
  },

  /**
   * Retrieve collection of document version for the given document id.
   * 
   * @method _getDocumentRange
   * @param options.id {Integer} The id of the desired document.
   * @param options.limit {Integer} The maximum number of versions to return.
   * @param options.offset {Integer} The offset of the first version to return.
   * @private
   * @static
   */
  _getDocumentRange: function(options) {
    var findUrl = '/documents/' + options.id + '/versions';
    return osapi.jive.core.getCollection({
      className: 'Document',
      findUrl: findUrl,
      jsonPath: '/data',
      limit: options.limit,
      offset: options.offset
    });
  }

});

osapi.jive.core.documents['private'] = {
  /* private.create */
  /**
   * <p>Create a new private document.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for creating the private document</code>
   *   <code>var document = {userId: '@viewer',</code>
   *   <code>                  subject: 'my document',</code>
   *   <code>                  html: 'document content'};</code>
   *   <code>var request = osapi.jive.core.documents.private.create(document);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method private.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new document</td><td></td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new document</td><td></td></tr>
   * <tr><td>attachmentURIs</td><td>URI[]</td><td>false</td><td>An array of URIs for binary attachments that
   * will be added to the document.</td><td></td></tr>
   * <tr><td>viewURIs</td><td>URI[]</td><td>false</td><td>Array of user URIs (of the form '/user/id')
   * to whom this document will be visible, or <code>[ "@all" ]</code> to make it visible to all users.</td>
   * <td>If this property is missing or an empty list, visibility defaults to the document author only.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a new discussion.
   * @static
   */
  create: function(options) {
    var userId = options.userId;
    if(userId !== '@viewer') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.discussions.messages.error.invalidUserId + ': ' + userId
      );
    }
    var params = {
      className: 'Document',
      createUrl: '/my/private/documents',
      params: {
        html: options.html,
        subject: options.subject,
        attachmentURIs : options.attachmentURIs ? options.attachmentURIs : []
      }
    };
    return osapi.jive.core.createObject(params);
  },

  /* private.get */
  /**
   * <p>Allows access to the logged in user's private <a href="osapi.jive.core.Document.html">documents</a>.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting the private documents</code>
   *   <code>var request = osapi.jive.core.documents.private.get({userId: '@viewer'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method private.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of documents to return. If there are fewer
   * documents available in the given time period, then fewer documents will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the documents in the container using the
   * given query.</td></tr>
   * <tr><td>userId</td><td>'@viewer'</td><td>true</td><td>This method is only valid for the currently logged in user. 
   * Thus, userId must be '@viewer'</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the requested documents.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    var userId = options.userId;
    if(userId !== '@viewer') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.documents.messages.error.invalidUserId + ': ' + userId
      );
    }
    var params = {
      after: options.after,
      before: options.before,
      className: 'Document',
      findUrl: '/my/private/documents',
      jsonPath: '/data',
      limit: options.limit,
      offset: options.offset,
      q: options.query
    };
    return osapi.jive.core.getCollection(params);
  }
};

//----------------------------------------------------------------------------------------------------------- BinaryBody

osapi.jive.core.documents.Binary = function(json) {
  //console.log('---> Constructing an osapi.jive.core.documents.Binary');

  var that = this;
  osapi.jive.extend(this, json);

  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: this.ref,
    methodName: 'requestUploadReplacement'
  });

};


/********** core/Group.js **********/

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
/**
 * <p class="definition">A Group is a user-defined container in Jive. Groups may contain blogs, discussions, documents
 * and projects.</p>
 * <p>Group objects can either be full or summarized. When a list of Groups is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full group from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Group object from the server by executing it.</p>
 * @class Group
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.DocumentUploadable
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Sharable
 */
osapi.jive.core.Group = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Group');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {};

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      members: {
        allowed: ['GET', 'POST'],
        ref: this.resources.self.ref + '/members'
      },
      invites: {
        allowed: ['GET', 'POST'],
        ref: this.resources.self.ref + '/invites'
      },
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      }
    });
  };
  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

    /* avatarURL */
    /**
    * <p>The URL of the group's avatar image</p>
    * @property avatarURL
    * @type URL
    */
    osapi.jive.core.extendWithImageURL(this, 'avatar');
    if (this.avatarURL) {
    /**
    * <p>The URL of the group's small avatar image</p>
    * @property avatarSmallURL
    * @type URL
    */
    this.avatarSmallURL = this.avatarURL + "?size=small";
    /**
    * <p>The URL of the group's medium avatar image</p>
    * @property avatarMediumURL
    * @type URL
    */
    this.avatarMediumURL = this.avatarURL + "?size=medium";
    /**
    * <p>The URL of the group's large avatar image</p>
    * @property avatarLargeURL
    * @type URL
    */
    this.avatarLargeURL = this.avatarURL + "?size=large";
    }

    delete this['avatar'];

  /* creationDate */
  /**
   * <p>The date/time that the group was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* creator */
  /**
   * <p>The user that created the group. This is a summarized User object.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * @property creator
   * @type <a href="osapi.jive.core.User.html">osapi.jive.core.User</a>
   */
  if(this.creator) {
    this.creator = new osapi.jive.core.User(this.creator);
  }

  /* description */
  /**
   * <p>The "Description" of the group set by the group owner when the group was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>description: "A group for engineering"</code></div>
   * @property description
   * @type String
   */

  /* displayName */
  /**
   * <p>The URL extention that is used to access the blog. This is a system generated value based on the group name.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>displayName: "my-group"</code></div>
   * @property displayName
   * @type String
   */

  /* groupType */
  /**
   * <p>Specifies the visibility of the group.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>groupType: "OPEN"</code></div>
   * @property groupType
   * @type "OPEN" | "MEMBER_ONLY" | "PRIVATE" | "SECRET"
   */

  /* modificationDate */
  /**
   * <p>The date/time that the group was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* name */
  /**
   * <p>The name of the group. This is the "Group Name" set by the group owner.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "My Group"</code></div>
   * @property name
   * @type String
   */

  /* viewCount */
  /**
   * <p>The number of times the group has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* activities */
  /**
   * <p>Retrieve <a href="osapi.jive.core.Activity.html">activities</a> that apply to this group</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the group's activities</code>
   *   <code>var request = group.activities.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 activities will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>type</td><td>String[]</td><td>false</td><td>The types of activities that are desired.</td>
   * <td><ul><li>The type corresponds to an activity's 
   * <a href="osapi.jive.core.EntitySummaryHolder.html#property_entitySummary.type">entitySummary.type</a></li></ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @method activities.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of activities for this group.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* blog */
  /**
   * <p>Retrieve the <a href="osapi.jive.core.Blog.html">blog<a> that is contained in this group.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the group's blog</code>
   *   <code>var request = group.blog.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method blog.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the blog for this group.
   */

  /* content */
  /**
   * <p>Retrieve content in this group. The type of objects in this collection can include:</p>
   * <ul>
   * <li><a href="osapi.jive.core.Document.html">osapi.jive.core.Document</a></li>
   * <li><a href="osapi.jive.core.Discussion.html">osapi.jive.core.Discussion</a></li>
   * <li><a href="osapi.jive.core.Post.html">osapi.jive.core.Post</a></li>
   * </ul>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the group's content</code>
   *   <code>var request = group.content.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var contentItems = response.data;</code>
   *   <code>    for(i = 0; i < contentItems.length; i++) {</code>
   *   <code>      var contentItem = contentItems[i]</code>
   *   <code>      if(contentItem instanceof osapi.jive.core.Document) {</code>
   *   <code class='comment'>        // do something with the document.</code>
   *   <code>      } else if(contentItem instanceof osapi.jive.core.Discussion) {</code>
   *   <code class='comment'>        // do something with the discussion.</code>
   *   <code>      } else ...</code>
   *   <code>    }</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method content.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of content objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 content objects will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of content items for this group.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Group');

  /* discussions */
  /**
   * <p>Create a new discussion in this group</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new discussion</code>
   *   <code>var discussion = {subject: 'my subject', html: 'my content'}</code>
   *   <code>var request = group.discussions.create(discussion);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new discussion.
   */
  /**
   * <p>Retrieve all discussions that are contained in this group.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving desired discussions</code>
   *   <code>var request = group.discussions.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of discussion objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 discussions will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the discussions in the group using
   * the given query.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the discussions for this group. When the request is executed, an array of 
   * <a href="osapi.jive.core.Discussion.html">Discussion</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* documents */
  /**
   * <p>Create a new document in this group</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new document</code>
   *   <code>var request = group.documents.create({subject: 'my subject', html: 'my content'});</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new document</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new document</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new document.
   */
  /**
   * <p>Retrieve all documents that are contained in the group</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving desired documents</code>
   *   <code>var request = group.documents.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of document objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 documents will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the documents in the group using
   * the given query.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the documents for this group. When the request is executed, an array of 
   * <a href="osapi.jive.core.Document.html">Document</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */
  
  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* invites */
  /**
   * <p>Send invitations to one or more individuals to join the group</p>
   * <p>Since 2.2</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for sending invites for the group</code>
   *   <code>var request = group.invites.create({invitees: ['user1'], body: 'Please join my group'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method invites.create
   * @param body {String} The content of the message that will be sent to the invitees.
   * @param invitees {String[]} Array containing a set of usernames and/or email addresses for people that should be
   * invited to the group
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will send invites for this group.
   */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Invite.html">invites</a> for the group</p>
   * <p>Since 2.2</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the invites for the group</code>
   *   <code>var request = group.invites.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method invites.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of invites that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 invites will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * <tr><td>offset</td><td>Integer</td><td>false</td><td>The number of results which should be skipped in the returned
   * collection. For instance, if the first 25 results have already been retrieved then results after the 25th result
   * can be retrieved by specifying an offset of 25.</td><td><ul><li>Default value is 0</li><li>The minimum value for
   * the offset is 0, specifying anything less than 0 for the offset will result in an error.</li></ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return a collection of invites for this group.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* Members */
  /**
   * <p>Add a member to a group</p>
   * <p>Since 2.2</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for adding members to the group</code>
   *   <code>var request = group.members.create({username: 'user1', state:'member'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method members.create
   * @param state {String} The initial membership state ("banned", "member", "owner", or "pending").
   * @param username {String} The username of the user to be added to this group.
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will add a member to this group.
   */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Member.html">members</a> for the group</p>
   * <p>Since 2.2</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the members for the group</code>
   *   <code>var request = group.members.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method members.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of members that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 members will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * <tr><td>offset</td><td>Integer</td><td>false</td><td>The number of results which should be skipped in the returned
   * collection. For instance, if the first 25 results have already been retrieved then results after the 25th result
   * can be retrieved by specifying an offset of 25.</td><td><ul><li>Default value is 0</li><li>The minimum value for
   * the offset is 0, specifying anything less than 0 for the offset will result in an error.</li></ul></td></tr>
   * <tr><td>state</td><td>String</td><td>false</td><td>States if specified, limit the returned members to those who
   * have one of these states</td><td><ul>
   * <li>Valid states are "banned", "member", "owner" or "pending"</li>
   * </ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return a collection of members for this group.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* projects */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Project.html">projects</a> that are contained in the group</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the projects in the group</code>
   *   <code>var request = group.projects.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method projects.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Project objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 projects will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return a collection of projects for this group.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* requestDocumentUpload */
  // TODO We should not be constructing the URL here. Remove once the server provides it.
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'binaryDocuments', options.findUrl, 'groups', that.id),
    binaryDocument: true,
    methodName: 'requestDocumentUpload'
  });

  /* share */
  /**
   * <p>Share the group with one or more other users</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the project's parent</code>
   *   <code>var request = group.share.create({html: 'Have a look at this', userURIs: ['/user/2002']});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method share.create
   * @param html {String} The message that will be sent to the user(s) that are being shared with.
   * @param userURIs {Array} Array of user URIs for users that the group should be shared with.
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will cause the gropu to be shared with one or more other users.
   */

  /* share */
  /* see osapi.jive.impl.Sharable */

};

//------------------------------------------------------------------------------------- osapi.jive.core.groups namespace

/**
 * <p class="definition">This static class allows you to retrieve
 * <a href="osapi.jive.core.Group.html">groups</a> from Jive.</p>
 * @class groups
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.groups', {

  /**
   * <p>Get a <a href="osapi.jive.core.Group.html">group</a> or a collection of groups</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Return the group record with the given ID.</code>
   *   <code>var request = osapi.jive.core.groups.get({id: 2001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired project.</td><td><ul>
   * <li>If no id is provided, then all groups will be returned.</li>
   * </ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of groups that should be found. </td>
   * <td><ul>
   * <li>This option is only valid if 'id' is not specified.</li>
   * <li>If this parameter is omitted, 25 groups will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul></td>
   * </tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the the requested group or array of groups.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};

    if(options.id) {
      return osapi.jive.core.groups._getByID(options.id);
    } else {
      var params = {
        limit: options.limit,
        offset: options.offset
      };
      return osapi.jive.core.groups._getAll(params);
    }
  },

  /**
   * Get a collection of all groups
   * 
   * @method _getAll
   * @private
   * @static
   */
  _getAll: function(params) {
    osapi.jive.extend(params, {
      className: 'Group',
      findUrl: '/groups',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  /**
   * Get a group via a group ID
   * 
   * @method _getByID
   * @param {String}  id    ID of the group to look up
   * @private
   * @static
   */
  _getByID: function(id) {
    return osapi.jive.core.getObject({
      className: 'Group',
      findUrl: '/groups/' + id,
      jsonPath: '/'
    });
  },

  /**
   * <p>Create a new <a href="osapi.jive.core.Group.html">group</a></p>
   * <p><span class='title'>Since:</span></p>
   * <p>2.3</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Create a new group.</code>
   *   <code>var request = osapi.jive.core.groups.create({</code>
   *   <code>  name: 'group',</code>
   *   <code>  type: 'OPEN',</code>
   *   <code>  displayName: 'My group',</code>
   *   <code>  description: 'This is my group',</code>
   *   <code>  contentTypes: ['document']</code>
   *   <code>});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method create
   * @param options The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>name</td><td>String</td><td>true</td><td>The name of the new group</td><td>
   * <ul>
   * <li>The group name must be unique within the Jive instance</li>
   * </ul></td></tr>
   * <tr><td>type</td><td>OPEN | MEMBER_ONLY | PRIVATE | SECRET</td><td>false</td><td>The visibility of the new group
   * within the system</td><td><ul>
   * <li>If not type, is specified, the OPEN is used</li>
   * </ul></td></tr>
   * <tr><td>displayName</td><td>String</td><td>true</td><td>The name used in the URL when viewing content in the
   * specified group</td><td></td></tr>
   * <tr><td>description</td><td>String</td><td>true</td><td>A text description of this group</td><td></td></tr>
   * <tr><td>contentTypes</td><td>Array</td><td>false</td><td>A collection of content types that may be contained
   * in this group.</td><td><ul>
   * <li>If omitted, all supported types will be allowed.</li>
   * </ul></td></tr>
   * </table>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a new group.
   * @static
   */
  create: function(options) {
    var params = {
      name: options.name,
      type: options.type,
      displayName: options.displayName,
      description: options.description,
      contentTypes: options.contentTypes
    };
    var _options = {
      className: 'Group',
      createUrl: '/groups',
      params: params
    };
    return osapi.jive.core.createObject(_options);
  }

});


/********** core/Image.js **********/

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
osapi.jive.core.Image = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Image');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  //------------------------------------------------------------------------------------------------------------ Methods

  this.destroy = function() {
    return osapi.jive.core.destroyObject({
      destroyUrl: that.ref
    });
  };

};

//------------------------------------------------------------------------------------- osapi.jive.core.images namespace

/**
 * <p class="definition">This static class allows for the upload of images to Jive.</p>
 * @class images
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.images', {
  
  messages: {
    error: {
      invalidImageId: 'Invalid image ID'
    }
  },

  /**
   * <p>Request that an image be uploaded to Jive. This function will cause the container to pop up a file
   * dialog with which the user can select the image they wish to upload.</p>
   * @method requestImageUpload
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  requestImageUpload: function(callback, options) {
    options = options || {};
    //console.log('---> Executing: requestImageUpload');
    var token = shindig.auth.getSecurityToken();
    osapi.jive.extend(options, {
      actionUrl: osapi.jive.core._constructUploadActionUrl(undefined, 'images'),
      core: true
    });
    var rpcCallback = function(item) {
      //console.log('---> Received callback');
      //console.log(item);
      if(typeof callback === 'function') {
        if(item.code) {
          callback(osapi.jive.core._createErrorResponse(item));
        } else {
          if(item.ref) {
            item.ref = osapi.jive.core._getRelativeUrl(item.ref);
          }
          callback(new osapi.jive.core.Image(item));
        }
      }
    };
    gadgets.rpc.call( null, "request_core_api_upload", rpcCallback, null, options, token);
  }
});


/********** core/InboxEntry.js **********/

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
/**
 * <p>An entry in the user's inbox</p>
 * @class InboxEntry
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.IDHolder
 */
osapi.jive.core.InboxEntry = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.InboxEntry');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* actions */
  /**
   * <p>The collection of actions for the inbox entry.</p>
   * @property actions
   * @type <a href="osapi.jive.core.InboxEntryAction.html">InboxEntryAction</a>[]
   */
  if(this.actions) {
    for(i = 0; i < this.actions.length; i++) {
      this.actions[i] = new osapi.jive.core.InboxEntryAction(this.actions[i]);
    }
  }

  /* creationDate */
  /**
   * <p>The date/time that the inbox entry was created.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* body */
  /**
   * <p>The body of the inbox entry.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>&lt;a href="http://localhost:8080/people/user1" class="jive-username-link"&gt;Joe Smith…&lt;/a&gt;</code></div>
   * @property body
   * @type String
   */

  /* summary */
  /**
   * <p>A summarized version of the inbox entry</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>summary: "item summary"</code></div>
   * @property summary
   * @type String
   */

  /* title */
  /**
   * <p>The title of the inbox entry</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>title: "item title"</code></div>
   * @property title
   * @type String
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /**
   * <p>Ignore the inbox entry. This causes the item to be hidden without any action being taken</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for ignoring the inbox entry</code>
   *   <code>var request = inboxEntry.ignore();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method ignore
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will cause the inbox item to be ignored.
   */
  if(this.resources && this.resources.ignore && osapi.jive.inArray('DELETE', this.resources.ignore.allowed) != -1) {
    this.ignore = function() {
      var ref = that.resources.ignore.ref;
      //console.log('---> ignoring inbox item using: ' + ref);
      return osapi.jive.core.destroyObjectWithCallback({
        destroyUrl: osapi.jive.core._getRelativeUrl(ref)
      });
    };
  }

};

//------------------------------------------------------------------------------------- osapi.jive.core.InboxEntryAction

/**
 * <p>An action entry for an inbox item</p>
 * @class InboxEntryAction
 * @namespace osapi.jive.core
 */
osapi.jive.core.InboxEntryAction = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.InboxEntryAction');
  osapi.jive.extend(this, jsonResponse);

  var that = this;

  //--------------------------------------------------------------------------------------------------------- Properties

/* label */
  /**
   * <p>The label of the inbox entry action</p>
   * @property label
   * @type String
   */

  /* state */
  /**
   * <p>The state of the inbox entry action</p>
   * @property state
   * @type Integer
   */

  /* url */
  /**
   * <p>The url of the inbox entry action</p>
   * @property url
   * @type URL
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /**
   * <p>Resolve the inbox entry. This causes action to be executed.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for ignoring the inbox entry</code>
   *   <code>var request = inboxEntryAction.resolve();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method resolve
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will cause the inbox item to be resolved.
   */
  if(this.resources && this.resources.resolve && osapi.jive.inArray('POST', this.resources.resolve.allowed) != -1) {
    this.resolve = function() {
      var ref = that.resources.resolve.ref;
      //console.log('---> resolving inbox item using: ' + ref);
      return osapi.jive.core.createObject({
          createUrl: osapi.jive.core._getRelativeUrl(ref)
      });
    };
  }

};

//------------------------------------------------------------------------------- osapi.jive.core.inboxEntries namespace

/**
 * <p class="definition">This static class allows you to retrieve
 * <a href="osapi.jive.core.InboxEntry.html">InboxEntry</a> objects.</p>
 * @class inboxEntries
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.inboxEntries', {

  /*
   * Messages returned to callback functions.
   */
  messages: {
    error: {
      invalidInboxEntryType: 'Type must be actions or notifications',
      noCurrentInboxItem: 'There is no current inbox item'
    }
  },

  /**
   * <p>Retrieve a collection of <a href="osapi.jive.core.InboxEntry.html">InboxEntry</a> objects.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the inbox entries</code>
   *   <code>var request = osapi.jive.core.inboxEntries.get({type: 'notifications'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired inbox entry</td><td><ul>
   * <li>If no id is provided, all inbox entries will be returned</li>
   * </ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of inbox entry objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>This option is only valid if an 'id' is not provided</li>
   * <li>If this parameter is omitted, 25 inbox entries will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr>
   * <td>type</td><td>String</td><td>true</td><td>The type of inbox entries to retrieve.</td>
   * <td>Valid arguments: <ul><li>actions</li><li>notifications</li></ul></td>
   * </tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return an array of InboxEntry objects otherwise.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    if(options.type != 'actions' && options.type != 'notifications') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.inboxEntries.messages.error.invalidInboxEntryType
      );
    }
    if(options.id) {
      var params = {
        id: options.id,
        type: options.type
      };
      return osapi.jive.core.inboxEntries._getById(params);
    } else {
      var params = {
        after: options.after,
        before: options.before,
        limit:  options.limit,
        type: options.type
      };
      return osapi.jive.core.inboxEntries._getAll(params);
    }
  },

  /**
   * <p>Gets the active action that opened the current view.</p>
   * @method getActive
   * @return {Object} options, {@see #get}
   * @static
   */
  getActive: function(options) {
    var aqId = gadgets.views.getParams().jive_aq;
    if (!aqId) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
          osapi.jive.core.inboxEntries.messages.error.noCurrentInboxItem
      );
    }
    var opts = osapi.jive.extend({}, options, {
      id: aqId,
      type: 'actions'
    });
    return osapi.jive.core.inboxEntries.get(opts);
  },

  /**
   * Retrieve all inbox entries for the application
   * @param params {Object} Parameter object containing the values of the request parameters to be sent.
   * @static
   * @private
   */
  _getAll: function(params) {
    var context = params.type === 'actions' ? 'actions' : 'notifications';
    osapi.jive.extend(params, {
      className: 'InboxEntry',
      findUrl: '/inbox/' + context,
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  /**
   * Retrieve the action inbox entry by its ID.
   * @method _getById
   * @param params.type {String} The type of the desired InboxEntry, "actions" or "notifications"
   * @param params.id {Integer} The ID of the desired InboxEntry.
   * @private
   * @static
   */
  _getById: function(params) {
    var context = params.type === 'actions' ? 'actions' : 'notifications';
    return osapi.jive.core.getObject({
      className: 'InboxEntry',
      findUrl: '/inbox/' + context + '/' + params.id,
      jsonPath: '/'
    });
  }

});


/********** core/Invite.js **********/

/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

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
/**
 * <p class="definition">An Invite is an invitation that has been sent to a specified user to
 * join a specified group.</p>
 * <p>Since 2.3</p>
 *
 * @class Invite
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Invite = function(jsonResponse, options) {
  // console.log('---> Constructing an osapi.jive.core.Invote');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {}

  // ------------------------------------------------------------------------------------------------------ Properties

  /* body */
  /**
   * <p>The HTML body of the invitation message sent to this invitee.</p>
   *
   * @property body
   * @type String
   */

  /* email */
  /**
   * <p>The email address of the invitee.</p>
   *
   * @property email
   * @type String
   */

  /* group */
  /**
   * <p>The social group to which the user has been invited.  This is a summarized Group object.</p>
   *
   * @property group
   * @type <a href="osapi.jive.core.Group.html">osapi.jive.core.Group</a>
   */
  osapi.jive.core.extendWithGroupProperty(this);

  /* inviter */
  /**
   * <p>The Jive user who issued this invitation.</p>
   *
   * @property inviter
   * @type <a href="osapi.jive.core.User.html">osapi.jive.core.User</a>
   */
  osapi.jive.core.extendWithUserProperty(this, 'inviter');

  /* revokeDate */
  /**
   * <p>The date and time at which this invite was revoked (if any).</p>
   *
   * @property revokeDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* revoker */
  /**
   * <p>The jive user who revoked this invitation (if any).</p>
   *
   * @property revoker
   * @type <a href="osapi.jive.core.User.html">osapi.jive.core.User</a>
   */

  /* sentDate */
  /**
   * <p>The date and time at which this invite was most recently sent.</p>
   *
   * @property sentDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* state */
  /**
   * <p>The current state of this invitation.  The following values are defined:</p>
   * <table>
   *     <tr>
   *         <td>processing</td>
   *         <td>Background processing to send this invitation is in progress.  While this state value
   *             exists, no <code>sentDate</code> will be returned.</td>
   *     </tr>
   *     <tr>
   *         <td>sent</td>
   *         <td>This invite has been sent to the invitee, but he or she has not yet accepted it.</td>
   *     </tr>
   *     <tr>
   *         <td>fulfilled</td>
   *         <td>Intermediate processing of this invite has been completed, but further action
   *             by group administrators may still be required.</td>
   *     </tr>
   *     <tr>
   *         <td>deleted</td>
   *         <td>The final state of the invitation process.  At some point in the future, this invite will
   *             be purged from the system.</td>
   *     </tr>
   *     <tr>
   *         <td>revoked</td>
   *         <td>This invite has has been revoked by the inviter.  While in this state, the user who
   *             revoked this invite, and the date/time at which the revoke occurred, will be visible
   *             in the <code>revoker</code> and <code>revokeDate</code> properties, respectively.
   *             Later on, the state will be switched to <code>deleted</code>, and this invite will
   *             ultimately be purged from the system.</td>
   *     </tr>
   * </table>
   * <p>In an <code>update()</code> call, only the <code>state</code> property can be changed, and only
   * certain state transitions are allowed:</p>
   * <table>
   *     <tr>
   *         <th>From State</th>
   *         <th>To State</th>
   *         <th>Authorized For</th>
   *         <th>Notes</th>
   *     </tr>
   *     <tr>
   *         <td>processing, sent, or fulfilled</td>
   *         <td>accepted</td>
   *         <td>Invitee</td>
   *         <td>Causes the invitation to be accepted and group membership established.  If the group is configured to require
   *             administrator approval, and this invite was not sent by a Jive admin or group admin, the membership will still
   *             be pending approval by a Jive or group administrator.</td>
   *     </tr>
   *     <tr>
   *         <td>processing, sent, or fulfilled</td>
   *         <td>resent</td>
   *         <td>Jive Admin, group admin, or the user who sent the invitation</td>
   *         <td>Causes the invitation to be resent to the corresponding invitee.</td>
   *     </tr>
   *     <tr>
   *         <td>any</td>
   *         <td>revoked</td>
   *         <td>Jive Admin, group admin, or the user who sent the invitation</td>
   *         <td>Causes the invitation to be revoked.</td>
   *     </tr>
   * </table>
   *
   * @property state
   * @type String
   */

  /* user */
  /**
   * <p>The Jive user who is the invitee of this invite, if known.  If all we have is an email address,
   * this property will not exist.</p>
   *
   * @property user
   * @type <a href="osapi.jive.core.User.html">osapi.jive.core.User</a>
   */
  osapi.jive.core.extendWithUserProperty(this, 'user');

  // --------------------------------------------------------------------------------------------------------- Methods

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Invite');

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this);
};

//------------------------------------------------------------------------------------ osapi.jive.core.invites namespace

/**
 * <p class="definition">This static class allows you to retrieve an <a href="osapi.jive.core.Invite.html">Invite</a>
 * by ID or an array of Invites in Jive for which you have access.</p>
 * <p>Since 2.3</p>
 * @class invites
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.invites', {

  /**
   * <p>Retrieve an invite object or a collection of invite objects.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting the invite</code>
   *   <code>var request = osapi.jive.core.invites.get({id: 1001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired invite</td><td><ul>
   * <li>If neither 'id', nor 'userId' are specified then all invites that are viewable by the logged in user will be
   * fetched</li>
   * </ul></td></tr>
   * <tr><td>userId</td><td>@viewer</td><td>false</td><td>Indicates that invites for the currently logged in user should
   * be retrieved</td><td><ul>
   * <li>This parameter is only valid if 'id' is not used</li>
   * <li>The only valid parameter value is @viewer</li>
   * <li>If this parameter is specified, 'groupId' must be specified as well</li>
   * </ul></td></tr>
   * <tr><td>groupId</td><td>@invited | @invites</td><td>false</td><td>Indicates if the invitations that were sent or
   * received by the logged in user should be fetched</td><td><ul>
   * <li>This parameter is only valid when 'userId' is used.</li>
   * <li>This parameter is required if 'userId' is used</li>
   * <li>If '@invited' is provided, then the invitations that have been sent by the viewer will be fetched</li>
   * <li>If '@invites' is provided, then the invitations that have been received by the viewer will be fetched</li>
   * </ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Invite objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>This option is only valid if an 'id' is not provided</li>
   * <li>If this parameter is omitted, 25 blogs will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return an Invite if an id was provided or an array of Invites otherwise.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    var url = null;
    if(options.id) {
      return osapi.jive.core.invites._getInviteById(options.id);
    } if(options.userId && options.groupId) {
      if(options.userId == '@viewer') {
        if(options.groupId) {
          switch(options.groupId) {
          case '@invited':
            url = '/my/invited';
            break;
          case '@invites':
            url = '/my/invites';
            break;
          }
        }
      }
    } else {
      url = '/invites';
    }
    var params = {
      inviterID: options.inviterID,
      inviteeID: options.inviteeID,
      groupID: options.groupID,
      limit: options.limit,
      offset: options.offset
    };
    if(url === null) {
      callback({
        error: { message: 'invalid groupId' }
      });
    } else {
      return osapi.jive.core.invites._getInvites(url, params);
    }
  },

  _getInviteById: function(id) {
    return osapi.jive.core.getObject({
      className: 'Invite',
      findUrl: '/invites/' + id,
      jsonPath: '/'
    });
  },

  _getInvites: function(url, params) {
    osapi.jive.extend(params, {
      className: 'Invite',
      findUrl: url,
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  }

});



/********** core/Mention.js **********/

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
/**
 * <p class="definition">This Class represents the mention of a <a href="osapi.jive.core.User.html">user</a> within
 * Jive.</p>
 * @class Mention
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.ContainerSummaryHolder
 * @uses osapi.jive.impl.EntitySummaryHolder
 * @uses osapi.jive.impl.Readable
 */
osapi.jive.core.Mention = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Mention');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null && this.resources && this.resources.self) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* containerSummary */
  osapi.jive.core.extendWithContainerSummaryProperty(this);

  /* creationDate */
  /**
   * <p>The date/time that the mention was created</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</span></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* entitySummary */
  osapi.jive.core.extendWithEntitySummaryProperty(this);

  /* user */
  /**
   * <p>The user that made the mention.</p>
   * @property user
   * @type <a href="osapi.jive.core.User.html">User</a>
   */
  osapi.jive.core.extendWithUserProperty(this);

  //------------------------------------------------------------------------------------------------------------ Methods

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Mention');

  /* read/unread */
  /* see osapi.jive.impl.Readable */

};

//----------------------------------------------------------------------------------- osapi.jive.core.mentions namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.Mention.html">mentions</a>
 * from Jive.</p>
 * @class mentions
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.mentions', {

  messages: {
    error: {
      invalidUserId: 'Invalid userId. Only \'@viewer\' is supported in this context'
    }
  },

  /**
   * <p>Retrieve a collection of mention objects for the logged in user.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting the curernt user's mentions</code>
   *   <code>var request = osapi.jive.core.mentions.get({userId: '@viewer'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Mention objects that should be
   * found. </td>
   * <td><ul><li>If this parameter is omitted, 25 mentions will be found.</li><li>If a non positive number is passed then an
   * error with code 400 will be passed to the callback.</li></ul></td></tr>
   * <tr><td>userId</td><td>'@viewer'</td><td>true</td><td>The ID of user for which mentions are desired.</td><td><ul>
   * <li>Mentions can only be retrieved for the currently logged in user, therefore, this option must be '@viewer'.</li>
   * </ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the the requested array of mentions.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};
    var params = {
      before: options.before,
      limit: options.limit
    };
    if(options.userId) {
      if(options.userId != '@viewer') {
        return osapi.jive.core._buildRequestWithStaticErrorResponse(
          osapi.jive.core.mentions.messages.error.invalidUserId + ": " + options.userId
        );
      }
      osapi.jive.extend(params, {
        after: options.after
      });
      return osapi.jive.core.mentions._getMentionsForCurrentUser(params)
    } else {
      return osapi.jive.core.mentions._getAllMentions(params);
    }
  },

  _getAllMentions: function(params) {
    osapi.jive.extend(params, {
      className: 'Communication',
      findUrl: '/communications/mentions',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  /**
   * Retrieve mention records for the logged in user.
   * 
   * @method _getMentionsForCurrentUser
   * @private
   * @static
   */
  _getMentionsForCurrentUser: function(params) {
    osapi.jive.extend(params, {
      className: 'Mention',
      findUrl: '/my/mentions', 
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  }

});


/********** core/Member.js **********/

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
/**
 * <p class="definition">A Member identifies the membership state of a particular user in a
 * particular social group.</p>
 *
 * @since 2.3
 * @class Member
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Member = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Member');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {};

  osapi.jive.core.extendWithResourcesMethods(this);

  // -------------------------------------------------------------------------------------------------------- Properties

  /* group */
  /**
   * <p>The group with which this membership object is associated.  This is a summarized Group object.</p>
   *
   * @property group
   * @type <a href="osapi.jive.core.Group.html">osapi.jive.core.Group</a>
   */
  if(that.group) {
    that.group = new osapi.jive.core.Group(that.group);
  };

  /* state */
  /**
   * <p>The state of the membership identified by this object.  The following values are defined:</p>
   * <table>
   *     <tr>
   *         <td>banned</td>
   *         <td>This user was a member of this group, but their activity within the group has
   *             been banned by a group administrator.</td>
   *     </tr>
   *     <tr>
   *         <td>invited</td>
   *         <td>This user has been invited to become a member of this group, but he or she
   *             has not yet accepted this invitation.  The user can accept this invitation
   *             by performing an update that changes the type to "member".</td>
   *     </tr>
   *     <tr>
   *         <td>member</td>
   *         <td>This user is a regular member of this group.  Regular members can access and
   *             create content within the group.</td>
   *     </tr>
   *     <tr>
   *         <td>owner</td>
   *         <td>This user is an administrator for this group.  Group administrators can delete
   *             content, manage invitations, and manage membership.</td>
   *     </tr>
   *     <tr>
   *         <td>pending</td>
   *         <td>This user has requested membership in this group, but that request
   *             has not yet been approved by a group administrator.</td>
   *     </tr>
   * </table>
   * <p>In an <code>update()</code> call, only the <code>type</code> can be changed, and only
   * certain state transitions are allowed:</p>
   * <table>
   *     <tr>
   *         <th>From State</th>
   *         <th>To State</th>
   *         <th>Restrictions</th>
   *     </tr>
   *     <tr>
   *         <td>banned</td>
   *         <td>member</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>banned</td>
   *         <td>owner</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>invited</td>
   *         <td>member</td>
   *         <td>Can only be performed by the invited user, or by a group administrator of this group.
   *             This will have a side effect of updating the state of the corresponding Invite.</td>
   *     </tr>
   *     <tr>
   *         <td>invited</td>
   *         <td>owner</td>
   *         <td>Can only be performed by a group administrator of this group.
   *             This will have a side effect of updating the state of the corresponding Invite.</td>
   *     </tr>
   *     <tr>
   *         <td>member</td>
   *         <td>banned</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>member</td>
   *         <td>owner</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>owner</td>
   *         <td>banned</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>owner</td>
   *         <td>member</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>pending</td>
   *         <td>member</td>
   *         <td>Can only be performed by the invited user, or by a group administrator of this group.</td>
   *     </tr>
   *     <tr>
   *         <td>pending</td>
   *         <td>owner</td>
   *         <td>Can only be performed by a group administrator of this group.</td>
   *     </tr>
   * </table>
   *
   * @property type
   * @type String
   */

  /* user */
  /**
   * <p>The user whose membership is being described by this object.  This is a summarized User object.</p>
   *
   * @property user
   * @type <a href="osapi.jive.core.User.html">osapi.jive.core.User</a>
   */
  osapi.jive.core.extendWithUserProperty(this, 'user');

  // ----------------------------------------------------------------------------------------------------------- Methods

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Member');

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Member');

};


/********** core/Message.js **********/

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
/**
 * <p class="definition">A message is a single entry in a <a href="osapi.jive.core.Discussion.html">discussion</a>.</p>
 * <p>Message objects can either be full or summarized. When a list of Messages is returned from the server, each 
 * object in the list will be a summarized version. It order to get the full message from a summarized object, use the
 * get method on the summarized object. This will provide a Request object that can then be used to obtain the full
 * version of the Message object from the server by executing it.</p>
 * @class Message
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AttachmentsHolder
 * @uses osapi.jive.impl.AttachmentUploadable
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.ContentHolder
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.ImageHolder
 * @uses osapi.jive.impl.Likable
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Message = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Message');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  osapi.jive.core.extendWithResourcesMethods(this);

//---------------------------------------------------------------------------------------------------------- Propeties

  /* answer */
  /**
   * <p>Has this message been marked as the answer to the question?</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This property will only be defined if
   * its value is true. Undefined should be taken as false.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>answer: true</code></div>
   * @property answer
   * @type Boolean
   */

  /* attachments */
  osapi.jive.core.extendWithAttachmentsProperty(this);

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* content */
  /* see osapi.jive.core.ContentHolder */

  /* creationDate */
  /**
   * <p>The date/time that the message was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* helpful */
  /**
   * <p>Has this message been marked as helpful?</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This property will only be defined if
   * its value is true. Undefined should be taken as false.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>helpful: true</code></div>
   * @property helpful
   * @type Boolean
   */

  /* likeCount */
  /**
   * <p>The number of people who have indicated that they like the message.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>likeCount: 5</code></div>
   * @property likeCount
   * @type Integer
   */

  /* modificationDate */
  /**
   * <p>The date/time that the message was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* replyCount */
  /**
   * <p>The number of replies that the message has recieved.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>replyCount: 3</code></div>
   * @property replyCount
   * @type Integer
   */

  /* status */
  /**
   * <p>Indicates if the message is draft or published.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</code></div>
   * @property status
   * @type 'draft' | 'published'
   */

  /* subject */
  /**
   * <p>The subject of the message.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>subject: "My Discussion"</span></div>
   * @property subject
   * @type String
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* attach image */
  /**
   * <p>Request that an image be uploaded and attached to the message. This function will cause the container to pop up
   * a file dialog with which the user can select the image they wish to upload.</p>
   * @method requestAttachImage
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'images', '/messages' + that.id, 'messages', that.id),
    methodName: 'requestAttachImage'
  });

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Message');

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Message');

  /* inResponseTo */
  /**
   * <p>Get the message that this message is in response to.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting the message this message is in response to</code>
   *   <code>var request = message.inResponseTo.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method inResponseTo.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the message that this message is in response to.
   */

  /* like/likes */
  osapi.jive.core.extendWithLikeMethods(this);

  /* parent */
  /**
   * <p>Get the <a href="osapi.jive.core.Discussion.html">discussion</a> which is the parent of this message.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting parent discussion</code>
   *   <code>var request = message.parent.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the parent discussion for this message.
   */

  /* replies */
  /**
   * <p>Create a reply to this message</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for creating a reply</code>
   *   <code>var reply = {subject: 'my subject', html: 'my reply'};</code>
   *   <code>var request = message.replies.create(reply);</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method replies.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new reply message</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new reply message</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new reply to this message.
   */
  /**
   * <p>Retrieve a collection of messages that were posted as replies to this message.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request object for getting replies</code>
   *   <code>var request = message.replies.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method replies.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of messages that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 messages will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the collection of messages that are replies to this message.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* requestAttachmentUpload */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'attachments'),
    methodName: 'requestAttachmentUpload'
  });

};

//----------------------------------------------------------------------------------- osapi.jive.core.messages namespace

osapi.jive.namespace('core.messages', {

});


/********** core/Place.js **********/

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
/**
 * <p class="definition">This static class allows you to ask the container to display a place-picker to the end-user
 * in order to select a project, space, blog, or group.</p>
 * @class places
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.places', {
  /**
   * Asks the Jive container to prompt the user to select a place.
   * @method requestPicker
   * @param options {Object} The following objects are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Notes</th></tr>
   * <tr><td>success</td><td>Function</td><td>true</td><td>Jive will pass the place the user selected to this
   * method.</td><td>The returned place can be a space, a group, a project, or a blog.</td></tr>
   * <tr><td>error</td><td>Function</td><td>false</td><td>Jive will trigger this call back when an error occurs
   * retrieving the place a user selected.</td><td></td></tr>
   * <tr><td>contentType</td><td>String</td><td>true</td><td>The type of content that the place contains</td>
   * <td>Valid arguments: <ul><li>document</li><li>discussion</li><li>post</li></ul></td></tr>
   * <tr><td>placeType</td><td>String</td><td>false</td><td>The type of place the user should select</td>
   * <td>Valid arguments: <ul><li>space</li><li>group</li><li>project</li><li>blog</li></ul></td></tr>
   * </table>
   * <p></p>
   * @static
   */
    requestPicker: function(options) {
        options = options || {};
        var success = options.success || function() {};
        var error   = options.error   || function() {};

        var pickerOptions = {};
        pickerOptions.containerType = osapi.jive.core.places._determineContainerType(options.placeType);
        pickerOptions.contentType = osapi.jive.core.places._determineContentType(options.contentType);

        var placeLoadCallback = function(data) {
            if (data && data.data) {
                success(data);
            }
            else if (data && data.error) {
                error(data.error);
            }
        };

        var pickerCallback = function(data) {
            var requestObj = osapi.jive.core.places._findPlace(data);
            requestObj.execute(placeLoadCallback);
        };
        gadgets.rpc.call(null, "request_place_picker", pickerCallback, pickerOptions);
    },
    _determineContainerType: function(placeType) {
        if (!placeType || placeType == "") {
            return 0;
        }
        switch (placeType) {
            case "space":
                return 14;
            case "group":
                return 700;
            case "project":
                return 600;
            case "blog":
                return 37;
            default:
                throw placeType + " is not a valid type.";
        }
    },
    _findPlace: function(data) {
        var core = osapi.jive.core;

        var requestObj;
        var requestOptions = {
            id: data.targetContainerID
        };
        switch (data.targetContainerType) {
            case 14: // COMMUNITY
                requestObj = core.spaces.get(requestOptions);
                break;
            case 700: // SOCIAL GROUP
                requestObj = core.groups.get(requestOptions);
                break;
            case 600: // PROJECT
                requestObj = core.projects.get(requestOptions);
                break;
            case 37: // BLOG
                requestObj = core.blogs.get(requestOptions);
                break;
            case 2020: // USER CONTAINER
                requestObj = core.users.get({id: "@viewer"});
                break;
        }
        return requestObj;
    },
    _determineContentType: function(contentType) {
        switch (contentType) {
            case "discussion":
                return 1;
            case "post":
                return 38;
            case "document":
                return 102;
            default:
                throw contentType + " is not a valid type.";
        }
    }
});

/********** core/Post.js **********/

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
/**
 * <p class="definition">A post is an individual entry in a <a href="osapi.jive.core.Blog.html">blog</a>.</p>
 * <p>Post objects can either be full or summarized. When a list of Posts is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full post from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Post object from the server by executing it.</p>
 * @class Post
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AttachmentsHolder
 * @uses osapi.jive.impl.AttachmentUploadable
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.Commentable
 * @uses osapi.jive.impl.ContentHolder
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.ImageHolder
 * @uses osapi.jive.impl.Likable
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Sharable
 * @uses osapi.jive.impl.Summarizable
 * @uses osapi.jive.impl.Trackable
*/
osapi.jive.core.Post = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Post');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      },
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      },
      track: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/tracks'
      },
      tracks: {
        allowed: ['DELETE', 'GET'],
        ref: this.resources.self.ref + '/tracks/2001'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* attachments */
  osapi.jive.core.extendWithAttachmentsProperty(this);

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* content */
  /* see osapi.jive.impl.ContentHolder */

  /* creationDate */
  /**
   * <p>The date/time that the post was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* likeCount */
  /**
   * <p>The number of users that have 'liked' the post</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>likeCount: "7"</code></div>
   * @property likeCount
   * @type Integer
   */

  /* modificationDate */
  /**
   * <p>The date/time that the post was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* published */
  /**
   * <p>The date/time that the blog was published.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>"published" : "2010-10-28T18:10:06.712+0000"</code></div>
   * @property published
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* replyCount */
  /**
   * <p>The number of replies that have been made to the post</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>replyCount: "4"</code></div>
   * @property replyCount
   * @type Integer
   */

  /* status */
  /**
   * <p>Indicates if the post is draft or published.<p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</code></div>
   * @property status
   * @type 'draft' | 'published'
   */

  /* subject */
  /**
   * <p>The subject of the blog post</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>subject: "My Post"</code></div>
   * @property subject
   * @type String
   */

  /* viewCount */
  /**
   * <p>The number of times the post has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* attach image */
  /**
   * <p>Request that an image be uploaded and attached to the post. This function will cause the container to pop up
   * a file dialog with which the user can select the image they wish to upload.</p>
   * @method requestAttachImage
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'images', '/posts' + that.id, 'posts', that.id),
    methodName: 'requestAttachImage'
  });

  /* comments */
  /* see osapi.jive.impl.Commentable */

  /* container */
  /**
   * <p>Retrieve the container for the post</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting the post's container</code>
   *   <code>var request = post.container.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method container.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the container for the post. This will generally be the
   * <a href="osapi.jive.core.Blog.html">Blog</a> in which the post was written.
   */

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Post');

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Post');

  /* like/likes */
  osapi.jive.core.extendWithLikeMethods(this);

  /* read */
  /* see osapi.jive.impl.Readable

  /* requestAttachmentUpload */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'attachments'),
    methodName: 'requestAttachmentUpload'
  });

  /* track */
  /* see osapi.jive.impl.Trackable */

  /* share */
  /* see osapi.jive.impl.Sharable */

};

//-------------------------------------------------------------------------------------- osapi.jive.core.posts namespace

osapi.jive.namespace('core.posts', {

});


/********** core/Project.js **********/

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
/**
 * <p class="definition">A project is a time bound container with in the Jive system. It can contain blog posts,
 * discussions, documents, polls and tasks</p>
 * <p>Project objects can either be full or summarized. When a list of Projects is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full project from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Project object from the server by executing it.</p>
* 
 * @class Project
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.DocumentUploadable
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Sharable
 */
osapi.jive.core.Project = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Project');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {};

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* creationDate */
  /**
   * <p>The date/time that the project was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* description */
  /**
   * <p>The "Description" of the project set by the project owner.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>description: "A project for task ABC"</code></div>
   * @property description
   * @type String
   */

  /* displayName */
  /**
   * <p>The URL extention that is used to access the project. This is a system generated value based on the project
   * name.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>displayName: "my-project"</code></div>
   * @property displayName
   * @type String
   */

  /* dueDate */
  /**
   * <p>The date/time that the project started.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>dueDate: "2010-10-30T18:10:06.712+0000"</code></div>
   * @property dueDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* modificationDate */
  /**
   * <p>The date/time that the project was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* name */
  /**
   * <p>This is the value given for "Project Name".</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "My Project"</code></div>
   * @property name
   * @type String
   */

  /* projectStatus */
  /**
   * <p>The status of the project:</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <ul>
   * <li>high = 'On Track'</li>
   * <li>medium = 'At Risk'</li>
   * <li>low = 'Critical'</li>
   * <li>complete = 'Complete'</li>
   * </ul>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>projectStatus: "high"</code></div>
   * @property projectStatus
   * @type 'high' | 'medium' | 'low' | 'complete'
   */

  /* startDate */
  /**
   * <p>The date/time that the project started.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>startDate: "2010-10-01T18:10:06.712+0000"</code></div>
   * @property startDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* status */
  /**
   * <p>Specifies if the project is active or archived.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "active"</code></div>
   * @property status
   * @type 'active' | 'archived'
   */

  /* viewCount */
  /**
   * <p>The number of times the project has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* activities */
  /**
   * <p>Retrieve <a href="osapi.jive.core.Activity.html">activities</a> that apply to this project</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the project's activities</code>
   *   <code>var request = project.activities.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 activities will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>type</td><td>String[]</td><td>false</td><td>The types of activities that are desired.</td>
   * <td><ul><li>The type corresponds to an activity's 
   * <a href="osapi.jive.core.EntitySummaryHolder.html#property_entitySummary.type">entitySummary.type</a></li></ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @method activities.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of activities for this project.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* blog */
  /**
   * <p>Retrieve the <a href="osapi.jive.core.Blog.html">blog<a> that is contained in this project.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method is only defined if the project has a blog.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the projects's blog</code>
   *   <code>var request = project.blog.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method blog.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the blog for this project.
   */

  /* content */
  /**
   * <p>Retrieve content in this project. The type of objects in this collection can include:</p>
   * <ul>
   * <li><a href="osapi.jive.core.Document.html">osapi.jive.core.Document</a></li>
   * <li><a href="osapi.jive.core.Discussion.html">osapi.jive.core.Discussion</a></li>
   * <li><a href="osapi.jive.core.Post.html">osapi.jive.core.Post</a></li>
   * </ul>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the project's content</code>
   *   <code'>var request = project.content.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var contentItems = response.data;</code>
   *   <code>    for(i = 0; i < contentItems.length; i++) {</code>
   *   <code>      var contentItem = contentItems[i]</code>
   *   <code>      if(contentItem instanceof osapi.jive.core.Document) {</code>
   *   <code class='comment'>        // do something with the document.</code>
   *   <code>      } else if(contentItem instanceof osapi.jive.core.Discussion) {</code>
   *   <code class='comment'>        // do something with the discussion.</code>
   *   <code>      } else ...</code>
   *   <code>    }</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method content.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of content objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 content objects will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of content items for this project.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* discussions */
  /**
   * <p>Create a new discussion in this project</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new discussion</code>
   *   <code>var discussion = {subject: 'my subject', html: 'my content'};</code>
   *   <code>var request = project.discussions.create(discussion);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new discussion.
   */
  /**
   * <p>Retrieve all discussions that are contained in the project.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving desired discussions</code>
   *   <code>var request = project.discussions.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of discussions to return. If there are fewer
   * discussions available in the given time period, then fewer discusions will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the discussions in the container using the
   * given query.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the discussions for this project. When the request is executed, an array of 
   * <a href="osapi.jive.core.Discussion.html">Discussion</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* documents */
  /**
   * <p>Create a new document in this project</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new document</code>
   *   <code>var request = project.documents.create({subject: 'my subject', html: 'my content'});</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new document</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new document</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new document.
   */
  /**
   * <p>Retrieve all documents that are contained in the project</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving desired documents</code>
   *   <code>var request =project.documents.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of documents to return. If there are fewer
   * documents available in the given time period, then fewer documents will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the documents in the container using the
   * given query.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the documents for this project. When the request is executed, an array of 
   * <a href="osapi.jive.core.Document.html">Document</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* owner */
  /**
   * <p>Retrieve the <a href="osapi.jive.core.User.html">User</a> that owns the project.
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the project's owner</code>
   *   <code>var request = project.owner.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method owner.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the owner of this project. When the request is executed, a 
   * <a href="osapi.jive.core.User.html">User</a> object will be returned.
   */

  /* parent */
  /**
   * <p>Retrieve the container that is the parent of the project.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the project's parent</code>
   *   <code>var request = project.parent.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the parent container for this project. When the request is executed, a 
   * <a href="osapi.jive.core.Group.html">Group</a> or
   * <a href="osapi.jive.core.Space.html">Space</a> object will be returned.
   */

  /* requestDocumentUpload */
  // TODO We should not be constructing the URL here. Remove once the server provides it.
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'binaryDocuments', options.findUrl, 'projects', that.id),
    binaryDocument: true,
    methodName: 'requestDocumentUpload'
  });

  /* share */
  /* see osapi.jive.impl.Sharable */

};

//----------------------------------------------------------------------------------- osapi.jive.core.projects namespace

/**
 * <p class="definition">This static class allows you to retrieve a <a href="osapi.jive.core.Project.html">Project</a>
 * by ID or an array of Projects in Jive for which you have access.</p>
 * @class projects
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.projects', {

  messages: {
    error: {
      invalidProjectId: 'Invalid project id'
    }
  },
    
  /**
   * <p>Retrieve a <a href="osapi.jive.core.Project.html">project</a> by its ID.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// get the request to get the project with the given ID.</code>
   *   <code>var request = osapi.jive.core.projects.get({id: 2001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>id</td><td>Integer</td><td>true</td><td>The ID of the desired project.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} A request object that, when
   * executed, will return a Project corresponding to the given ID.
   * @static
   */
  get: function(options) {
    options = options || {};
    if(!options.id) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.projects.messages.error.invalidProjectId + ': ' + options.id
      );
    }
    return osapi.jive.core.projects._getProjectById(options.id);
  },
  
  /**
   * Retrieve project record for the given project id.
   * 
   * @method _getProjectById
   * @param id {Integer} The id of the desired project.
   * @param callback {Function} The function that should be called with the results.
   * @private
   * @static
   */
  _getProjectById: function(id) {
    return osapi.jive.core.getObject({
      className: 'Project', 
      findUrl: '/projects/' + id, 
      jsonPath: '/'
    });
  }

});


/********** core/Search.js **********/

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

//----------------------------------------------------------------------------------- osapi.jive.core.searches namespace

/**
 * <p class="definition">This static class provides methods that can be used to search for content and places within
 * Jive.</p>
 * @class searches
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.searches', {

  /**
   * <p>Search for content in Jive</p>
   * <p>The collection that is returned from this search can include the following types:</p>
   * <ul>
   * <li><a href="osapi.jive.core.Comment.html">osapi.jive.core.Comment</a></li>
   * <li><a href="osapi.jive.core.Document.html">osapi.jive.core.Document</a></li>
   * <li><a href="osapi.jive.core.Discussion.html">osapi.jive.core.Discussion</a></li>
   * <li><a href="osapi.jive.core.Message.html">osapi.jive.core.Message</a></li>
   * <li><a href="osapi.jive.core.Post.html">osapi.jive.core.Post</a></li>
   * </ul>
   * <div class='example'><code class='comment'>// get the request for the search</code>
   *   <code>var request = osapi.jive.core.searches.searchContent({query: 'a'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method searchContent
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>from</td><td>String</td><td>false</td><td>Older items in terms of modification time (day granularity) will
   * be excluded from the search results.</td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <tr><td>query</td><td>String</td><td>true</td><td>A text string that will be searched for within Jive.</td></tr>
   * <tr><td>to</td><td>String</td><td>false</td><td>Newer items in terms of modification time (day granularity) will be
   * excluded from the search results.</td></tr>
   * <tr><td>type</td><td>Set</td><td>false</td><td>Set of content types to include in the search. When not specified
   * all content types available to open client will be searched.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the results of the search.
   * @static
   */
  searchContent: function(options) {
    osapi.jive.extend(options || {}, { findUrl: '/search/content', jsonPath: '/data' });
    return osapi.jive.core.searches._getSearchCollection(options);
  },
  
  /**
   * <p>Search for places in Jive</p>
   * <p>The collection that is returned from this search operation can include the following types:</p>
   * <ul>
   * <li><a href="osapi.jive.core.Blog.html">osapi.jive.core.Blog</a></li>
   * <li><a href="osapi.jive.core.Group.html">osapi.jive.core.Group</a></li>
   * <li><a href="osapi.jive.core.Project.html">osapi.jive.core.Project</a></li>
   * <li><a href="osapi.jive.core.Space.html">osapi.jive.core.Space</a></li>
   * </ul>
   * <div class='example'><code class='comment'>// get the request for the search</code>
   *   <code>var request = osapi.jive.core.searches.searchPlaces({query: 'a'});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method searchPlaces
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>from</td><td>String</td><td>false</td><td>Older items in terms of modification time (day granularity) will
   * be excluded from the search results.</td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <tr><td>query</td><td>String</td><td>true</td><td>The query string</td></tr>
   * <tr><td>to</td><td>String</td><td>false</td><td>Newer items in terms of modification time (day granularity) will be
   * excluded from the search results.</td></tr>
   * <tr><td>type</td><td>Set</td><td>false</td><td><p>Set of content types to include in the search. When not specified
   * all content types available to open client will be searched.</p>
   * <p>Valid types are</p> 
   * <ul><li>'blog'</li>
   * <li>'group'</li>
   * <li>'project'</li>
   * <li>'space'</li></ul> 
   * <p>More than one type can be specified. In this case pass an array of types.</p></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the results of the search.
   * @static
   */
  searchPlaces: function(options) {
    osapi.jive.extend(options || {}, { findUrl: '/search/places', jsonPath: '/data' });
    return osapi.jive.core.searches._getSearchCollection(options);
  },
  
  /**
   * Get the search collection using the jquery ajax capability.
   * 
   * @method _getSearchCollection
   * @param options {Object} The set of options used to process the call.
   * @private
   * @static
   */
  _getSearchCollection: function(options) {
    options = osapi.jive.extend({ limit: 25, offset: 0, multiple: true }, options || {});

    var params = osapi.jive.core._serializeToFormVars({
      from: options.from,
      limit: options.limit,
      offset: options.offset,
      q: options.query,
      sort : options.sort,
      sortOrder : options.sortOrder,
      to: options.to,
      type: options.type
    });
    var url = options.findUrl + (params ? '?' + params : '');

    //console.log('---> JSON GET (SEARCH): ' + url);
    var request = osapi.jive.core.get({ v: 'v2', href: url });
    osapi.jive.core._extendOsapiRequestWithResponseInterceptor(request, function(response) {
      var dataOut = response;
      //console.log(response);
      if(!osapi.jive.core._isError(response)) {
        var process = osapi.jive.core.searches._newSearchSuccessCallback({
          jsonPath: options.jsonPath,
          success: function(data) { dataOut = new osapi.jive.core.Response({ data: data }); }
        });
        process(response.content);
      } else {
        dataOut = osapi.jive.core._createErrorResponse(response);
      }
      return dataOut;
    });
    return request;
  },

  /**
   * Get the search collection using the jquery ajax capability.
   *
   * @method _getSearchCollection
   * @param options {Object} The set of options used to process the call.
   * @param callback {Function} The function that should be called with the results.
   * @private
   * @static
   */
  _getSearchCollectionWithCallback: function(options, callback) {
      this._getSearchCollection(options).execute(callback);
  },
  
  /**
   * Provide the callback that will be called when the ajax call to the server succeeds.
   * 
   * @method _newSearchSuccessCallback
   * @param options{Object} The set of options used to process the call. For this method the success function is
   *                        used to determine what to callback after the object conversion is done.
   * @private
   * @static
   */
  _newSearchSuccessCallback: function(options) {
    return function(responseJSON) {
      // Grab object out of response JSON
      var object = osapi.jive.jsonPathLite(responseJSON, options.jsonPath);
      var objects = osapi.jive.map(object, function(obj) {
        return osapi.jive.core.searches._createObjectFromJson(obj);
      });
      
      options.success(objects);
    };
  },
  
  /**
   * Create a Core API object from the passed in json object. The type of the object to create is determined
   * by the type property of the json object.
   * 
   * @param {Object}  json  The json object from which the Core API object should be constructed.
   * @private
   * @static
   */
  _createObjectFromJson: function(json) {
    var ctor = osapi.jive.core[osapi.jive.core._titleize(json.type)];
    if(ctor) {
      return new ctor(json);
    }
    //console.log('Unable to convert object: ' + json);
    return undefined;
  }
  
});


/********** core/Share.js **********/

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
/**
 * <p class="definition">A Share represents a piece of content within Jive that has been shared by one user to one or
 * more other users.</p>
 * @class Share
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.Mutable
 * @uses osapi.jive.impl.Summarizable
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Trackable
 */
osapi.jive.core.Share = function(jsonResponse) {
  //console.log('---> Constructing an osapi.jive.core.Share', jsonResponse);

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      },
      track: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/tracks'
      },
      tracks: {
        allowed: ['DELETE', 'GET'],
        ref: this.resources.self.ref + '/tracks/2001'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* participants */
  /**
   * <p>An array of Users with which the content is being shared.</p>
   * <p><span class='title'>Availability:</span> Full object..</p>
   * @property participants
   * @type <a href="osapi.jive.core.User.html">User[]</a>
   */
  if(this.participants) {
    for(var i = 0; i < this.participants.length; i++) {
      var participant = this.participants[i];
      this.participants[i] = new osapi.jive.core.User(participant);
    }
  }

  //------------------------------------------------------------------------------------------------------------ Methods

  /* destroy/update */
  osapi.jive.core.extendWithMutableMethods(this, 'Document');

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Share');

  /* read/unread */
  /* see osapi.jive.impl.Readable */

  /* track */
  /* see osapi.jive.impl.Trackable */

};

//-------------------------------------------------------------------------------------- osapi.jive.core.share namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.Share.html">
 * Share</a> objects.<p>
 * @class shares
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.shares', {

  /**
   * <p>Retrieve one share by it's ID or all shares</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for getting shares</code>
   *   <code>var request = osapi.jive.core.communications.get({id: 1001});</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   *   <tr>
   *     <th>Name</th>
   *     <th class='wider'>Type</th>
   *     <th>Required</th>
   *     <th>Description</th>
   *     <th>Behavior</th>
   *   </tr>
   *   <tr>
   *     <td>id</td>
   *     <td>Integer</td>
   *     <td>false</td>
   *     <td>The ID of the desired share</td>
   *     <td></td>
   *   </tr>
   *   <tr>
   *     <td>limit</td>
   *     <td>Integer</td>
   *     <td>false</td>
   *     <td>The maximum number of Share objects that should be found.</td>
   *     <td>
   *       <ul>
   *         <li>This option is only valid if an 'id' is not provided</li>
   *         <li>If this parameter is omitted, 25 shares will be found.</li>
   *         <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   *       </ul>
   *     </td>
   *   </tr>
   * </table>
   */
  get: function(options) {
    options = options || {};
    var params = {
      before: options.before,
      limit: options.limit
    };
    if(options.id) {
      return osapi.jive.core.shares._getShareById(options.id);
    } else
      return osapi.jive.core.shares._getAllShares(params);
  },

  _getShareById: function(id) {
    return osapi.jive.core.getObject({
      className:'Share',
      findUrl:'/shares/' + id,
      jsonPath:'/'
    });
  },

  _getAllShares:function(params) {
    params = params || {};
    osapi.jive.extend(params, {
      className: 'Communication',
      findUrl: '/communications/shares',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  }

});


/********** core/Space.js **********/

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
/**
 * <p class="definition">A space is an admin definable container in Jive. It can hold blogs, discussions, documents,
 * polls and projects</p>
 * <p>Space objects can either be full or summarized. When a list of Spaces is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full group from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Space object from the server by executing it.</p>
 * @class Space
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.DocumentUploadable
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Sharable
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.Space = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Space');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {};

  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* childcount */
  /**
   * <p>The number of child spaces that are contained within the space</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>childCount: 2</code></div>
   * @property childCount
   * @type Integer
   */

  /* creator */
  /**
   * <p>The user that created the space</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * @property creator
   * @type <a href="osapi.jive.core.User.html">User</a>
   */
  osapi.jive.core.extendWithUserProperty(this, 'creator');

  /* creationDate */
  /**
   * <p>The date/time that the space was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* description */
  /**
   * <p>The "Description" of the space set by the admin when the group was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>description: "A space for engineering"</code></div>
   * @property description
   * @type String
   */

  /* displayName */
  /**
   * <p>The URL extention that is used to access the space. This is the "Space Display Name" that the admin set when the
   * group was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>displayName: "my-space"</code></div>
   * @property displayName
   * @type String
   */

  /* modificationDate */
  /**
   * <p>The date/time that the space was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* name */
  /**
   * <p>The name of the space. This is the "Space Name" that the admin set when the group was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "My Space"</code></div>
   * @property name
   * @type String
   */

  /* viewCount */
  /**
   * <p>The number of times the space has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* activities */
  /**
   * <p>Retrieve <a href="osapi.jive.core.Activity.html">activities</a> that apply to this space</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the space's activities</code>
   *   <code>var request = space.activities.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 activities will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>type</td><td>String[]</td><td>false</td><td>The types of activities that are desired.</td>
   * <td><ul><li>The type corresponds to an activity's 
   * <a href="osapi.jive.core.EntitySummaryHolder.html#property_entitySummary.type">entitySummary.type</a></li></ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @method activities.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of activities for this space.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* blog */
  /**
   * <p>Retrieve the <a href="osapi.jive.core.Blog.html">blog</a> that is contained in this space.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects. This method will only be defined if the space contains a
   * blog.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the space's blog</code>
   *   <code>var request = space.blog.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method blog.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the blog for this space.
   */

  /* children */
  /**
   * <p>Get the array of direct children spaces for this space.</p>
   * <p><span class='title'>Availability:</span> Full object. This method will only be defined if the space has children
   * spaces.</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the space's children</code>
   *   <code>var request = space.children.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method children.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of direct children for this space.
   */

  /* content */
  /**
   * <p>Retrieve content in this space. The type of objects in this collection can include:</p>
   * <ul>
   * <li><a href="osapi.jive.core.Document.html">osapi.jive.core.Document</a></li>
   * <li><a href="osapi.jive.core.Discussion.html">osapi.jive.core.Discussion</a></li>
   * <li><a href="osapi.jive.core.Post.html">osapi.jive.core.Post</a></li>
   * </ul>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the space's content</code>
   *   <code>var request = space.content.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) {</code>
   *   <code>  if(!response.error) {</code>
   *   <code>    var contentItems = response.data;</code>
   *   <code>    for(i = 0; i < contentItems.length; i++) {</code>
   *   <code>      var contentItem = contentItems[i]</code>
   *   <code>      if(contentItem instanceof osapi.jive.core.Document) {</code>
   *   <code class='comment'>        // do something with the document.</code>
   *   <code>      } else if(contentItem instanceof osapi.jive.core.Discussion) {</code>
   *   <code class='comment'>        // do something with the discussion.</code>
   *   <code>      } else ...</code>
   *   <code>    }</code>
   *   <code>  }</code>
   *   <code>});</code>
   * </div>
   * @method content.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of content objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 content objects will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of content items for this space.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* discussions */
  /**
   * <p>Create a new <a href="osapi.jive.core.Discussion.html">discussion</a> in this space</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new discussion</code>
   *   <code>var discussion = {subject: 'my subject', html: 'my content'};</code>
   *   <code>var request = space.discussions.create(discussion);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new discussion.
   */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Discussion.html">discussions</a> that are contained in the space.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving desired discussions</code>
   *   <code>var request = space.discussions.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method discussions.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of discussions to return. If there are fewer
   * discussions available in the given time period, then fewer discusions will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the discussions in the container using the
   * given query.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the discussions for this space. When the request is executed, an array of 
   * Discussion objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* documents */
  /**
   * <p>Create a new <a href="osapi.jive.core.Document.html">document</a> in this space</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating the new document</code>
   *   <code>var document = {subject: 'my subject', html: 'my content'};</code>
   *   <code>var request = space.documents.create(document);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new document</td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new document</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new document.
   */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Document.html">documents</a> that are contained in the space</p>
   * <p><span class='title'>Availability:</span> All</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving desired documents</code>
   *   <code>var request = space.documents.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method documents.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of documents to return. If there are fewer
   * documents available in the given time period, then fewer documents will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the documents in the container using the
   * given query.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the documents for this space. When the request is executed, an array of 
   * Document objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Space');

  /* parent */
  /**
   * <p><span class='title'>Availability:</span> Full objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the parent space</code>
   *   <code>var request = space.parent.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method parent.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the current space's parent space.
   */

  /* projects */
  /**
   * <p>Retrieve all <a href="osapi.jive.core.Project.html">projects</a> that are contained in the space</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for retrieving the projects in the space</code>
   *   <code>var request = space.projects.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method projects.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of projects to return. If there are fewer
   * projects available in the given time period, then fewer projects will be
   * returned then the limit. If limit is not provided then a maximum of 25 elements will be returned.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the projects for this space. When the request is executed, an array of 
   * Project objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* share */
  /* see osapi.jive.impl.Sharable */

  // TODO We should not be constructing the URL here. Remove once the server provides it.
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'binaryDocuments', options.findUrl, 'spaces', that.id),
    binaryDocument: true,
    methodName: 'requestDocumentUpload'
  });

};

//------------------------------------------------------------------------------------- osapi.jive.core.spaces namespace

/**
 * <p class="definition">This static class allows you to retrieve <a href="osapi.jive.core.Space.html">Spaces</a>
 * from Jive.</p>
 * @class spaces
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.spaces', {

  /**
   * <p>Get a <a href="osapi.jive.core.Space.html">space</a> or a collection of spaces</p>
   * <div class='example'>
   *   <span class='title'>Example:</span>
   *   <span class='comment'>//Return the space record with the given ID.</span>
   *   <span class='code'>var request = osapi.jive.core.spaces.get({id: 2001});</span>
   *   <span class='comment'>// execute the request</span>
   *   <span class='code'>request.execute(function(response) { ... });</span>
   * </div>
   * @method get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>id</td><td>Integer</td><td>false</td><td>The ID of the desired space.</td><td><ul>
   * <li>If no id is provided, then all spaces will be returned.</li>
   * </ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of spaces that should be found. </td>
   * <td><ul>
   * <li>This option is only valid if 'id' is not specified.</li>
   * <li>If this parameter is omitted, 25 spaces will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul></td>
   * </tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">osapi.jive.core.Request</a>} The request object that,
   * when executed, will return the the requested space or array of spaces.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};

    if(options.id) {
      return osapi.jive.core.spaces._getByID(options.id);
    } else {
      var params = {
        limit: options.limit,
        offset: options.offset
      };
      return osapi.jive.core.spaces._getAll(params);
    }
  },

  /**
   * Get a collection of all spaces
   * 
   * @method _getAll
   * @private
   * @static
   */
  _getAll: function(params) {
    osapi.jive.extend(params, {
      className: 'Space',
      findUrl: '/spaces',
      jsonPath: '/data'
    });
    return osapi.jive.core.getCollection(params);
  },

  /**
   * Get a space via a space ID
   * 
   * @method _getByID
   * @param spaceId {String} ID of the space to look up
   * @private
   * @static
   */
  _getByID: function(id) {
    return osapi.jive.core.getObject({
      className: 'Space',
      findUrl: '/spaces/' + id,
      jsonPath: '/'
    });
  }

});


/********** core/Update.js **********/

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
/**
 * <p class="definition">Represents an update by a user in the Jive system. An update is similar to a microblog entry.
 * It is generally short in length and meant to communicate a brief status of the user.</p>
 * <p>Update objects can either be full or summarized. When a list of Updates is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full update from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * Update object from the server by executing it.</p>
 * @class Update
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.AuthorHolder
 * @uses osapi.jive.impl.Commentable
 * @uses osapi.jive.impl.ContentHolder
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Likable
 * @uses osapi.jive.impl.Readable
 * @uses osapi.jive.impl.Sharable
 * @uses osapi.jive.impl.Summarizable
 * @uses osapi.jive.impl.Trackable
 */
osapi.jive.core.Update = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Update');

  var that = this;
  osapi.jive.extend(this, jsonResponse);
  options = options || {};
  
  /**
   * Add a temporary links.
   * TODO: Remove these once the server provides support
   */
  if(typeof(applyLinkHack) !== 'undefined' && applyLinkHack !== null) {
    this.resources = osapi.jive.extend(this.resources, {
      read: {
        allowed: ['DELETE', 'POST'],
        ref: this.resources.self.ref + '/read'
      },
      share: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/share'
      },
      track: {
        allowed: ['POST'],
        ref: this.resources.self.ref + '/tracks'
      },
      tracks: {
        allowed: ['DELETE', 'GET'],
        ref: this.resources.self.ref + '/tracks/2001'
      }
    });
  };

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* author */
  osapi.jive.core.extendWithAuthorProperty(this);

  /* content */
  /* see osapi.jive.impl.ContentHolder */

  /* creationDate */
  /**
   * <p>The date/time that the update was created.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* likeCount */
  /**
   * <p>The number of people who have indicated that they like the update.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>likeCount: 5</code></div>
   * @property likeCount
   * @type Integer
   */

  /* modificationDate */
  /**
   * <p>The date/time that the update was last modified.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* original */
  /**
   * <p>If this update has been reposted, this property will be defined to point to the Update</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * @property original
   * @type <a href="osapi.jive.core.Update.html">Update</a>
   */
  if(this.repost) {
    this.original = new osapi.jive.core.Update(this.repost);
  }

  /* replyCount */
  /**
   * <p>The number of replies that the update has recieved.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>replyCount: 3</code></div>
   * @property replyCount
   * @type Integer
   */

  /* status */
  /**
   * <p>Indicates if the update is draft or published.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>status: "published"</code></div>
   * @property status
   * @type 'draft' | 'published'
   */

  /* viewCount */
  /**
   * <p>The number of times the update has been viewed.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>viewCount: 4</code></div>
   * @property viewCount
   * @type Integer
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* attach image */
  /**
   * <p>Request that an image be uploaded and attached to the update. This function will cause the container to pop up
   * a file dialog with which the user can select the image they wish to upload.</p>
   * @method requestAttachImage
   * @param callback {Function} Function that should be called back once the upload is complete.
   * @param options {Object} A map of optional parameters that can be passed into the upload request. Valid
   * parameters are:
   * <ul>
   * <li>dialogTitle: The title that should be displayed in the chrome of the upload dialog</li>
   * <li>instructionMsg: An application specific message that should be displayed at the top of the upload dialog</li>
   * </ul>
   */
  osapi.jive.core.extendWithUploadMethods(this, {
    actionUrl: osapi.jive.core._constructUploadActionUrl(this, 'images', options.findUrl, 'updates', that.id),
    methodName: 'requestAttachImage'
  });

  /* comments */
  /* see osapi.jive.impl.Commentable */

  /* destroy */
  /**
   * <p>Request that the server remove this Update object.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for removing the update</code>
   *   <code>var request = update.destroy();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will request that the update be removed by the server.
   */
  osapi.jive.core.extendWithMutableMethods(this, 'Update');

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'Update');

  /* images.get */
  /**
   * <p>Fetch the set of images for the update</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for fetching the update's images</code>
   *   <code>var request = update.images.get();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method images.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will fetch the set of images for the update.
   */
  this.images = {
    get: function() {
      return osapi.jive.core.getCollection({
        className:'Image',
        findUrl:'/updates/' + that.id + '/images',
        jsonPath:'/'
      });
    }
  };

  /* like/likes */
  osapi.jive.core.extendWithLikeMethods(this);

  /**
   * </p>Get a request that can be used to cause that the server to repost this Update object.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for reposting the update</code>
   *   <code>var request = update.repost.create();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method repost.create
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will request that the update be reposted by the server.
   */
  if(this.resources.self) {
    this.repost = {
      create: function(options) {
        options = options || {};
        if(!options.html) {
          return osapi.jive.core._buildRequestWithStaticErrorResponse(
            'Must pass an html element'
          );
        }
        return osapi.jive.core.createObject({
          className: 'Update',
          createUrl: osapi.jive.core._getRelativeUrl(that.resources.self.ref),
          params: options
        });
      }
    };
  }

  /**
   * <p>Publish an Update object that is in the draft state.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>//Get the request object for publishing the update</code>
   *   <code>var request = update.publish();</code>
   *   <code class='comment'>// execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method publish
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will request that the update be published by the server.
   */
  if(this.resources.self && this.status == 'draft') {
    this.publish = function() {
      return osapi.jive.core.updateObject({
        body: that,
        className: 'Update',
        updateUrl: osapi.jive.core._getRelativeUrl(that.resources.self.ref)
      });
    };
  }

  /* read/unread */
  /* see osapi.jive.impl.Readable */

  /* share */
  /* see osapi.jive.impl.Sharable */

  /* track */
  /* see osapi.jive.impl.Trackable */

};

//------------------------------------------------------------------------------------ osapi.jive.core.updates namespace

/**
 * <p class="definition">This static class allows you to retrieve and create
 * <a href="osapi.jive.core.Update.html">updates</a> in Jive.</p>
 * @class updates
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.updates', {

  messages: {
    error: {
      invalidUserId: 'Expected a userId of @viewer',
      missingHtmlParam : 'Html parameter of update object is required',
      missingUpdateObject: 'Must provide an update object'
    }
  },

  /**
   * <p>Create a new <a href="osapi.jive.core.Update.html">update</a>.</p>
   * @method create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content of the update</td><td></td></tr>
   * <tr><td>latitude</td><td>Float</td><td>false</td><td>The latitude of the User when the update was made.</td><td></td></tr>
   * <tr><td>longitude</td><td>Float</td><td>false</td><td>The longitude of the User when the update was made</td><td></td></tr>
   * <tr><td>isDraft</td><td>String</td><td>false</td><td>Should the update be put in 'draft' mode</td><td><ul>
   * <li>The default value is 'false'</li>
   * </ul></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create the new update.
   * @static
   */
  create: function(options) {
    options = osapi.jive.extend({
      userId: '@viewer'
    }, options || {});
    
    if(options.userId != '@viewer') {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.updates.messages.error.invalidUserId
      );
    }
    if(!options.update) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.updates.messages.error.missingUpdateObject
      );
    } else if(!options.update.html) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.updates.messages.error.missingHtmlParam
      );
    }
    //options.update.html = escape(options.update.html);
    return osapi.jive.core.createObject({
      className: 'Update',
      createUrl: '/my/updates',
      params: options.update
    });
  },
  
  /**
   * <p>Get <a href="osapi.jive.core.Update.html">updates</a></p>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>userId</td><td>Integer | '@viewer'</td><td>false</td><td>The ID of the User or '@viewer' for the current
   * user. In order to call this method with an ID other than '@viewer', a user ID will need to have been obtained
   * from some other object that contains it. For example, a User object retrieved through the osapi.jive.core.users.get
   * method will contain the ID of the user.</td>
   * <td><ul><li>If no userId is provided, then all updates visible to the logged in user will be found.</li>
   * <li>If a numeric userId is provided, then the updates for the user specified by the userId will be found.</li>
   * <li>If '@viewer' is provided, then the updates for the currently logged in user will be found</li>
   * <li>If a numeric id is provided that can not be found in the database, then an error object with code set to 404
   * will be passed to the callback.</li><li>If a non-numeric id that is not '@viewer' is passed, then an error object with message set
   * to 'Invalid userId' will be passed to the callback.</li></ul></td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of updates that should be found. </td>
   * <td><ul><li>If this parameter is omitted, 25 updates will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li></ul></td>
   * </tr>
   * </table>
   * <p></p>
   * @method get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the update or collection of updates..
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   * @static
   */
  get: function(options) {
    options = options || {};

    var getUrl = "/updates";

    if(options.userId && options.userId === '@viewer') {
      getUrl = '/my/updates';
    }
    else if (options.userId && typeof options.userId === 'number') {
      getUrl = '/users/' + options.userId + '/updates/'
    }
    else if (options.userId) {
      return osapi.jive.core._buildRequestWithStaticErrorResponse(
        osapi.jive.core.updates.messages.error.invalidUserId
      );
    }
    else if (options.id) {
      getUrl = '/updates/' + options.id;
    }

    var params = {
      limit: options.limit,
      offset: options.offset,
      className: 'Update',
      findUrl: getUrl,
      jsonPath: (options.id ? '/' : '/data')
    };
    return osapi.jive.core.getObjectOrCollection((options.id ? options.id : 'all'), params);
  }

});


/********** core/User.js **********/

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
/**
 * <p class="definition">Represents an individual that interacts with the Jive system.</p>
 * <p>A user is established for an individual by the system administrator. In order to use Jive, an individual must
 * authenticate with Jive using the username and password associated with the user. Once this has been done, the 
 * individual will be able to interact with the system.<p>
 * <p>User objects can either be full or summarized. When a list of Users is returned from the server, each object in 
 * the list will be a summarized version. It order to get the full user from a summarized object, use the get method on
 * the summarized object. This will provide a Request object that can then be used to obtain the full version of the
 * User object from the server by executing it.</p>
 * @class User
 * @namespace osapi.jive.core
 * @uses osapi.jive.impl.Followable
 * @uses osapi.jive.impl.IDHolder
 * @uses osapi.jive.impl.Summarizable
 */
osapi.jive.core.User = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.User', options);

  options = options || {};
  var that = this;
  osapi.jive.extend(this, jsonResponse);

  osapi.jive.core.extendWithResourcesMethods(this);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* avatarURL */
  /**
   * <p>The URL of the user's avatar image</p>
   * @property avatarURL
   * @type URL
   */
  osapi.jive.core.extendWithImageURL(this, 'avatar');

  /* creationDate */
  /**
   * <p>The date/time that the user was created.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>creationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property creationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* email */
  /**
   * <p>The user's registered email address.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>email: "mary@test.com"</code></div>
   * @property email
   * @type String
   */

  /* enabled */
  /**
   * <p>Indicates if the user is enabled or disabled.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>enabled: true</code></div>
   * @property enabled
   * @type Boolean
   */

  /* firstName */
  /**
   * <p>The user's given name.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>firstName: "Mary"</code></div>
   * @property firstName
   * @type String
   */

  /* lastName */
  /**
   * <p>The user's surname.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>lastName: "Smith"</code></div>
   * @property lastName
   * @type String
   */

  /* level */
  /**
   * <p>The user's status level.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * @property level
   * @type <a href="osapi.jive.core.Level.html">Level</a>
   */
  if(this.level) {
    this.level = new osapi.jive.core.Level(this.level);
  }

  /* modificationDate */
  /**
   * <p>The date/time that the blog was last modified.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>modificationDate: "2010-10-28T18:10:06.712+0000"</code></div>
   * @property modificationDate
   * @type <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601 Date</a>
   */

  /* name */
  /**
   * <p>The user's full name.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>name: "Mary Smith"</code></div>
   * @property name
   * @type String
   */

  /* username */
  /**
   * <p>The username that the User uses to log into Jive.</p>
   * <p><span class='title'>Availability:</span> Full and summarized objects</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='property'>username: "mary.smith"</code></div>
   * @property username
   * @type String
   */

  //------------------------------------------------------------------------------------------------------------ Methods

  /* activities */
  /**
   * <p>Retrieve <a href="osapi.jive.core.Activity.html">activities</a> that apply to this user</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the group's activities</code>
   *   <code>var request = user.activities.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Activity objects that should be
   * found. </td>
   * <td>
   * <ul>
   * <li>If this parameter is omitted, 25 activities will be found.</li>
   * <li>If a non positive number is passed then an error with code 400 will be passed to the callback.</li>
   * </ul>
   * </td></tr>
   * <tr><td>type</td><td>String[]</td><td>false</td><td>The types of activities that are desired.</td>
   * <td><ul><li>The type corresponds to an activity's 
   * <a href="osapi.jive.impl.EntitySummaryHolder.html#property_entitySummary.type">entitySummary.type</a></li></ul>
   * </td></tr>
   * </table>
   * <p></p>
   * @method activities.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the array of activities for this user.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* blog */
  /**
   * <p>Get a request object that can be used to obtain the user's blog</p>
   * <p><span class='title'>Availability:</span> Full object. The method will only be defined if the user has a blog.</p>
   * <p><span class='title'>Example:</span></p>
  * <div class='example'><code class='comment'>// Get the request object for retrieving the user's blog</code>
   *   <code>var request = user.blog.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method blog.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's blog.
   */

  /* colleagues */
  /**
   * <p>Get a request object that can be used to obtain the collection of colleagues for this user.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's colleagues</code>
   *   <code>var request = user.colleagues.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method colleagues.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the colleagues for this user. When the request is executed an array of 
   * User objects will be returned.
   */

  /* connections */
  /**
   * <p>Get a request object that can be used to obtain the collection of connections for this user.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's connections</code>
   *   <code>var request = user.connections.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method connections.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the connections for this user. When the request is executed an array of
   * User objects will be returned.
   */
  /**
   * <p>Get a request object that can be used to create a connection between the logged in user and this user.
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's connections</code>
   *   <code>var request = user.connections.create();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method connections.create
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a connection between the logged in user and this user.
   */
  /**
   * <p>Get a request object that can be used to remove a connection between the logged in user and this user.
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's connections</code>
   *   <code>var request = user.connections.destroy();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method connection.destroy
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will remove a connection between the logged in user and this user.
   */
  /**
   * <p>Get a request object that can be used to determine if the logged in user has a pending connection to the provided
   * user</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for checking a pending connection</code>
   *   <code>var request = user.connection.pending.get({userId: 2002});</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method connections.pending.get
   * @param userId {Number} The id of the user to check for a pending connection.
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return a user object if a connection is pending with that user.
   *
   */
  if(this.connections) {
    this.connections.pending = {
      get: function(options) {
        options = options || {};
        if(options.userId) {
          var url = that.resources.connections.ref + '/pending/' + options.userId;
          return osapi.jive.core.getObject({
            className: 'User',
            findUrl: url,
            jsonPath: '/'
          });
        } else {
          return osapi.jive.core._buildRequestWithStaticErrorResponse(
            'invalid userId'
          );
        }
      }
    };
  }

  /* follower */
  osapi.jive.core.extendWithFollowMethods(this);

  /* get */
  osapi.jive.core.extendWithSummarizableMethods(this, 'User');

  /* manager */
  /**
   * <p>Get a request object that can be used to obtain the user's manager</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's manager</code>
   *   <code>var request = user.manager.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method manager.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's Manager.
   */

  /* reports */
  /**
   * <p>Get a request object that can be used to obtain the list of direct reports for the user.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's reports</code>
   *   <code>var request = user.reports.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method reports.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's direct reports. When the request is executed an array of User objects will
   * be returned.
   */

  /* private discussions */
  /**
   * <p>Create a new private discussion for the user</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating a new private discussion</code>
   *   <code>var discussion = {subject: 'my discussion', html: 'content', userURI: ['/users/2002']};</code>
   *   <code>var request = user.privateDiscussions.create(discussion);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method privateDiscussions.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new discussion</td><td></td></tr>
   * <tr><td>question</td><td>Boolean</td><td>false</td><td>Should this discussion be considered a question?</td>
   * <td><ul><li>Default value is false</li></ul></td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new discussion</td><td></td></tr>
   * <tr><td>userId</td><td>'@viewer'</td><td>true</td><td>The userID for which to create the discussion</td>
   * <td><ul><li>This method is only valid for the currently logged in user. Thus, userId must be '@viewer'</li></ul>
   * </td></tr>
   * <tr><td>userURI</td><td>URI[]</td><td>true</td><td>An array of URIs for user who will participate in the
   * discussion.</td><td><ul><li>User URIs are of the form '/users/id'</li></ul></td></tr>
   * <tr><td>attachmentURIs</td><td>URI[]</td><td>false</td><td>An array of URIs for binary attachments that
   * will be added to the discussion.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a new private discussion.
   */
  /**
   * <p>Get a request object that can be used to obtain the list of private discussions for the user</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for getting private discussions</code>
   *   <code>var request = user.privateDiscussions.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method privateDiscussions.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Discussion objects that should be
   * found. </td>
   * <td><ul><li>If this parameter is omitted, 25 discussions will be found.</li><li>If a non positive number is passed then an
   * error with code 400 will be passed to the callback.</li></ul></td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the discussions in the container using the
   * given query.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's private discsussions. When the request is executed an array of 
   * <a href="osapi.jive.core.Document.html">Discussion</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /* private documents */
  /**
   * <p>Create a new private document for the user.</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for creating a new private document</code>
   *   <code>var document = {subject: 'my document', html: 'content'};</code>
   *   <code>var request = user.privateDocuments.create(document);</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method privateDocuments.create
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>html</td><td>String</td><td>true</td><td>The content body of the new document</td><td></td></tr>
   * <tr><td>subject</td><td>String</td><td>true</td><td>The subject of the new document</td><td></td></tr>
   * <tr><td>attachmentURIs</td><td>URI[]</td><td>false</td><td>An array of URIs for binary attachments that
   * will be added to the document.</td><td></td></tr>
   * <tr><td>viewURI</td><td>URI[]</td><td>false</td><td>Array of user URIs (of the form '/user/id')
   * to whom this document will be visible, or <code>[ "@all" ]</code> to make it visible to all users.</td>
   * <td>If this property is missing or an empty list, visibility defaults to the document author only.</td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will create a new private document.
   */
  /**
   * <p>Get a request object that can be used to obtain the list of private documents for the user</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for getting private documents</code>
   *   <code>var request = user.privateDocuments.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method privateDocuments.get
   * @param options {Object} The following options are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Behavior</th></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of Document objects that should be
   * found. </td>
   * <td><ul><li>If this parameter is omitted, 25 documents will be found.</li><li>If a non positive number is passed then an
   * error with code 400 will be passed to the callback.</li></ul></td></tr>
   * <tr><td>query</td><td>String</td><td>false</td><td>When provided, will search the documents in the container using the
   * given query.</td><td></td></tr>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's private documents. When the request is executed an array of 
   * <a href="osapi.jive.core.Document.html">Document</a> objects will be returned.
   * <p></p>
   * <p><b>NOTE:</b> When the request is executed, a Javascript array will be returned. This array may not contain all
   * possible values due to an explicit or implicit limit. Because of this, the array can potentially have two
   * additional methods: next() and/or previous(). If there are additional elements available, next() can be used to
   * obtain the next set and similarly previous() can be used to obtain the previous set.</p>
   */

  /**
   * <p>Get a request object that can be used to obtain the user's updates</p>
   * <p><span class='title'>Availability:</span> Full object</p>
   * <p><span class='title'>Example:</span></p>
   * <div class='example'><code class='comment'>// Get the request object for retrieving the user's updates</code>
   *   <code>var request = user.updates.get();</code>
   *   <code class='comment'>// Execute the request</code>
   *   <code>request.execute(function(response) { ... });</code>
   * </div>
   * @method updates.get
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return the user's direct reports. When the request is executed an the user's updates.
   */

};

//-------------------------------------------------------------------------------------- osapi.jive.core.users namespace

/**
 * <p class="definition">This static class allows you to retrieve
 * <a href="osapi.jive.core.User.html">users</a> in Jive.</p>
 * @class users
 * @namespace osapi.jive.core
 * @static
 */
osapi.jive.namespace('core.users', {

  /**
   * Asks the Jive container to prompt the user to select one or more users.
   * @method requestPicker
   * @param options {Object} The following objects are supported:
   * <p></p>
   * <table>
   *   <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Notes</th></tr>
   *   <tr><td>multiple</td><td>String</td><td>false</td><td>Whether to allow user to select multiple users</td><td></td></tr>
   *   <tr><td>success</td><td>Function</td><td>true</td><td>Jive will pass the user objects the user selected to this method.<td></td></td>
   *     <td>The returned object is an osapi.jive.core.Response object with a data key, containing either a single osapi.jive.core.User object or an array if selecting multiple.</td></tr>
   *   <tr><td>error</td><td>Function</td><td>false</td><td>Jive will trigger this call back when an error occurs retrieving the selected users, returning the error from the server.</td><td></td></tr>
   * </table>
   * <p></p>
   * @static
   */
  requestPicker: function(options) {
    options = options || {};
    var success = options.success || function() {};
    var error   = options.error   || function() {};

    var pickerOptions = {};
    pickerOptions.multiple = options.multiple || false;

    // take the osapi.jive.core.User object(s) returned from pickerCallback
    // and execute the callback initially passed into the requestPicker success/error
    var userLoadCallback = function(data) {
      if (data && data.data) {
        success(data);
      }
      else if (data && data.error) {
        error(data.error);
      }
    };

    // take the data returned from the picker and convert it into full
    // osapi.jive.core.User objects
    var pickerCallback = function(data) {

      if (data.users.length == 1) {
        // handle single case, no batch:
        osapi.jive.core.users.get({id: data.users[0].userID}).execute(function(response) {
          userLoadCallback(response);
        });
      } else if (data.users.length > 1) {

        // handle multiple case, using batch:
        var users = [];
        var batch = osapi.newBatch();
        for(var i = 0; i < data.users.length; i++) {
          batch.add("user" + i, osapi.jive.core.get({v: 'v2', href: '/users/' + data.users[i].userID}));
        }
        batch.execute(function(result) {
          for(var i = 0; i < data.users.length; i++) {
            users[users.length] = new osapi.jive.core.User(result['user' + i].content);
          }
          var response = new osapi.jive.core.Response({data: users});
          userLoadCallback(response);
        });
      }

    };

    gadgets.rpc.call(null, "request_user_picker", pickerCallback, pickerOptions);
  },

  /**
   * Retrieve a <a href="osapi.jive.core.User.html">User</a> or a collection of Users.
   * <ul>
   * <li>username: name of the desired user</li>
   * <li>id: id of the desired user</li>
   * <li>emailAddress: email address of the desired user</li>
   * </ul>
   * @method get
   * @param options {Object} The following objects are supported:
   * <p></p>
   * <table>
   * <tr><th>Name</th><th class='wider'>Type</th><th>Required</th><th>Description</th><th>Notes</th></tr>
   * <tr><td>emailAddress</td><td>String</td><td>false</td><td>The email address of the desired user.</td>
   * <td>May not be used together with id or username.</td></tr>
   * <tr><td>id</td><td>Integer | @viewer | @anonymous</td><td>false</td><td>The id of the desired user or @viewer to
   * indicate the currently logged in user or @anonymous to indicate the system guest user.</td><td>May not
   * be used together with emailAddress or username</td></tr>
   * <tr><td>groupId</td><td>Integer</td><td>false</td><td>The id of the group that defines the set of users to be
   * returned</td><td>
   * <p>Valid values are:
   * <ul>
   * <li>@colleagues - Return the viewer's colleagues</li>
   * <li>@followers - Return the users that are currently following the viewer</li>
   * <li>@manager - Return the viewer's manager</li>
   * <li>@reports - Return the viewer's direct reports</li>
   * </ul>
   * </p>
   * <p><b>Note:</b> This options is only valid if 'id' is set to '@viewer'.</p>
   * </td></tr>
   * <tr><td>username</td><td>String</td><td>false</td><td>The username of the desired user</td><td>May not be used
   * together with emailAddress or id</td></tr>
   * <tr><td>limit</td><td>Integer</td><td>false</td><td>The maximum number of User objects that should be
   * found.</td><td>This parameter is used only if 'emailAddress', 'id' and 'username' are not specified.</td>
   * <tr><td>query</td><td>String</td><td>false</td><td>The query that is used to select users to return.</td><td>
   * This parameter is used only if 'emailAddress', 'id' and 'username' are not specified.</td>
   * </table>
   * <p></p>
   * @return {<a href="osapi.jive.core.Request.html">Request</a>} The request object that,
   * when executed, will return a user or list of users depending on the input to the method.
   * @static
   */
  get: function(options) {
    options = options || {};
    var params = {
      limit: options.limit,
      offset: options.offset,
      q: options.query
    };
    if(!options) {
      return osapi.jive.core.users._getAll(params);
    }
    if(options.id) {
      params = osapi.jive.extend(params, {
        followingUserId: options.followingUserId,
        pending: options.pending
      });
      return osapi.jive.core.users._getById(options.id, options.groupId, params);
    } else if(options.username) {
      return osapi.jive.core.users._getByName(options.username);
    } else if(options.emailAddress) {
      return osapi.jive.core.users._getByEmailAddress(options.emailAddress);
    } else {
      return osapi.jive.core.users._getAll(params);
    }
  },
  
  /**
   * Get all Users
   * 
   * @method _getAll
   * @private
   * @static
   */
  _getAll: function(params) {
    osapi.jive.extend(params || {}, { className: 'User', jsonPath: '/data' });
    return osapi.jive.core.getObjectOrCollection('all', params);
  },
  
  /**
   * Find a user via their email address
   * 
   * @method _getByEmailAddress
   * @param emailAddress {String} The email address of the user to look up
   * @private
   * @static
   */
  _getByEmailAddress: function(emailAddress) {
    return osapi.jive.core.getObject({
      className: 'User', 
      findUrl: '/users/email/' + emailAddress,
      jsonPath: '/'
    });
  },
  
  /**
   * Find a user via their user ID
   * 
   * @method _getById
   * @param id {String} ID of the user to look up
   * @param groupId {String} ID of the group to look up
   * @private
   * @static
   */
  _getById: function(id, groupId, options) {
    //console.log(id, groupId, options);
    options = options || {};
    var jsonPath;
    var url;
    var mergeParams = false;
    if(id == '@viewer') {
      calculatedId = 'all';
      jsonPath = '/data';
      if(groupId) {
        switch(groupId) {
        case '@colleagues':
          url = '/my/colleagues';
          mergeParams = true;
          break;
        case '@followers':
          url = '/my/followers';
          if(options.followingUserId) {
            if(options.pending === true) {
              url += '/pending';
            }
            url += '/' + options.followingUserId;
            calculatedId = 'none';
            jsonPath = '/';
          }
          mergeParams = true;
          break;
        case '@manager':
          url = '/my/manager';
          calculatedId = 'none';
          jsonPath = '/';
          break;
        case '@reports':
          url = '/my/reports';
          mergeParams = true;
          break;
        default:
          return osapi.jive.core._buildRequestWithStaticErrorResponse(
            'invalid groupId'
          );
        }
      } else {
        url = '/my';
        calculatedId = 'none';
        jsonPath = '/';
      }
    } else if(id == '@anonymous') {
      calculatedId = 'none';
      jsonPath = '/';
      url = '/users/anonymous'
    } else {
      if(typeof groupId != 'undefined') {
        return osapi.jive.core._buildRequestWithStaticErrorResponse(
          'groupId not support for ids other than @viewer'
        );
      }
      calculatedId = id;
      jsonPath = '/';
      url = '/users/' + id;
    }
    var params = {
      className: 'User', 
      findUrl: url, 
      jsonPath: jsonPath
    };
    if(mergeParams) {
      osapi.jive.extend(params, {
        limit: options.limit,
        offset: options.offset
      });
    }
    return osapi.jive.core.getObjectOrCollection(calculatedId, params);
  },

  /**
   * Find a user via their username
   *
   * @method _getByName
   * @param username {String} Username of the user to look up
   * @private
   * @static
   */
  _getByName: function(username) {
    return osapi.jive.core.getObject({
      className: 'User', 
      findUrl: '/users/username/' + username, 
      jsonPath: '/'
    });
  }

});

//------------------------------------------------------------------------------------------------ osapi.jive.core.Level
/**
 * <p class="definition">This Class provides <a href="osapi.jive.core.User.html">user</a> status level within Jive.</p>
 * @class Level
 * @namespace osapi.jive.core
 */
osapi.jive.core.Level = function(jsonResponse, options) {
  //console.log('---> Constructing an osapi.jive.core.Level');

  var that = this;
  osapi.jive.extend(this, jsonResponse);

  //--------------------------------------------------------------------------------------------------------- Properties

  /* imageURL */
  /**
   * <p>The URL of the image that represents this level</p>
   * @property imageURL
   * @type URL
   */
  osapi.jive.core.extendWithImageURL(this, 'image');

  /* name */
  /**
   * <p>The name of the level</p>
   * @property name
   * @type String
   */

  /**
   * <p>The number of points that have been earned by the <a href="osapi.jive.core.User.html">user</a>.
   * @property points
   * @type Integer
   */
};
