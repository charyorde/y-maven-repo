/*
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/********** core/jsonPathLite.js **********/

/**
 * $.jsonPathLite
 *
 * Simple utility class for drilling down into a json object and grabbing what you want.
 * XPath like, but very basic. Only supports slashes.
 *
 * @example
 *   var obj = {
 *     "foo": {
 *       "bar" : "baz"
 *     }
 *   };
 *   
 *   $.jsonPathLite(obj, '/foo/bar') == "baz" // true
 *
 */
(function($) {

  $.jsonPathLite = function(object, path) {
    if(object === null) {
      return null;
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
      return $.jsonPathLite(result, parts.join('/'));
    } else {
      return result;
    }

  };

})(jQuery);

// **** Tests - uncomment to run


// $(document).ready(function() {
// 
//   module("JsonPathLite");
// 
//   test("should get the object located at /foo", function() {
//     var obj = {"foo" : "bar"};
//     equal ($.jsonPathLite(obj, '/foo'), "bar");
//   });
//
//   test("should get the object located at /foo/bar", function() {
//     var obj = {
//       "foo": {
//         "bar" : "baz"
//       }
//     };
//
//     equal($.jsonPathLite(obj, '/foo/bar'), "baz");
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
//     equal($.jsonPathLite(obj, '/foo/bar/baz'), "heyoo");
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
//     equal($.jsonPathLite(obj1, '/foo/bar/baz'), null);
//     equal($.jsonPathLite(obj2, '/foo/bar/baz'), null);
//     equal($.jsonPathLite(obj3, '/foo/bar/baz'), null);
//     equal($.jsonPathLite(obj4, '/foo/bar/baz'), null);
//   });
// 
// });


/********** core/oc.js **********/

/**
 * Namespace central to the Jive OpenClient-JS framework.
 *
 * @name jive.oc
 * @namespace
 */
jive.namespace('oc', {
  /** @lends jive.oc */

  legacyPath : '/__services/openclient/v3',
  basePath   : '/api/openclient/v3',

  containers : {
    group   : {ID:700},
    project : {ID:600},
    space   : {ID:14}
  },

  baseUrl: function() {
    if(typeof gadgets != 'undefined') {
      var proxyUrl = gadgets.io.getProxyUrl();
      var rootUrl  = proxyUrl.split('?')[0].replace(/\/gadgets\/proxy/, '');
      return rootUrl + jive.oc.basePath;
    } else {
      return jive.oc.basePath;
    }
  },

  /**
   * Returns the default options that all jive.oc ajax methods use, with any overrides or extra options.
   * Certain options are only applicable to a subset of the jive.oc ajax methods.
   *
   * @param {Object}     options             A javascript object that can override the default options
   * @param {String}     options.className   A string containing the name of the class to instantiate. Example: "BlogPost"
   * @param {String}     options.contentType The type of content to return. Defaults to 'application/json; charset=utf-8'
   * @param {String}     options.createUrl   The URL to POST when creating a new resource
   * @param {String}     options.destroyUrl  The URL to DELETE when destroying an existing resource
   * @param {Function}   options.error       The callback function to execute when an error occurs in the HTTP request
   * @param {String}     options.findUrl     The URL to GET when retrieving an existing resource
   * @param {String}     options.httpMethod  The HTTP method to use. Examples: GET, POST, PUT, DELETE
   * @param {Object}     options.jsClass     The actual js class, as opposed to a string. Example: jive.oc.Activity
   * @param {String}     options.jsonPath    The JSON object path where the item(s) are in the response JSON. Example: "/ActivitiesCollection/Activities"
   * @param {Function}   options.success     The callback function to execute when an HTTP request is successful.
   *
   * @return the default options, along with any overrides
   */
  setDefaultOptions: function(options) {
    options = $.extend({
      className  : 'ClassName',
      createUrl  : '/createUrl',
      destroyUrl : '/destroyUrl',
      error      : function() {},
      findUrl    : '/findUrl',
      success    : function() {}
    }, options || {});

    options['jsClass']  = options['jsClass']  || (jive.oc[options.className] || Object);

    return options;
  },

  /**
   * Get a collection of OpenClient JSON objects via Ajax
   *
   * @param {Object}     options             A javascript object that can override the default options
   * @param {Number}     options.limit       The number of results to return. Defaults to 10.
   * @param {Number}     options.offset      The number of items to skip before starting to return items. Defaults to 0.
   */
  getCollection: function(options) {
    options = this.setDefaultOptions($.extend({
      limit     : 10,
      offset    : 0,
      multiple  : true
    }, options || {}));
    options['jsonPath'] = options['jsonPath'] || ('/' + options.className + 'Collection/' + options.className + 's');

    $.ajax({
      cache    : false,
      data     : {limit: options.limit, offset: options.offset},
      dataType : 'json',
      type     : 'GET',
      url      : jive.oc.baseUrl() + options.findUrl,
      success  : this._newObjectSuccessCallback(options),
      error    : options.error
    });
  },

  /**
   * Get a single OpenClient JSON object via Ajax
   *
   * @param {Object}     options             A javascript object that can override the default options
   */
  getObject: function(options) {
    options = this.setDefaultOptions(options || {});
    options['jsonPath'] = options['jsonPath'] || ('/' + options.className);

    $.ajax({
      cache    : false,
      dataType : 'json',
      type     : 'GET',
      url      : jive.oc.baseUrl() + options.findUrl,

      success  : this._newObjectSuccessCallback(options),
      error    : options.error
    });
  },

  /**
   * Get a single object or a collection, depending if id is "all" or a number
   *
   * @param {Integer|String}   id        Unique id of the object, or the string "all"
   * @param {Object}           options   A javascript object that can override the default options
   */
  getObjectOrCollection: function(id, options) {
    options = $.extend({
      collectionUrl : '/' + options.className.toLowerCase() + 's',
      objectUrl     : '/' + options.className.toLowerCase() + 's/' + id
    }, options || {});

    if(id == 'all') {
      return this.getCollection($.extend({findUrl: options.collectionUrl}, options));
    } else {
      return this.getObject($.extend({findUrl: options.objectUrl}, options));
    }
  },

  /**
   * Create a single OpenClient JSON object via Ajax
   *
   * @param {Object}     options             A javascript object that can override the default options
   */
  createObject: function(options) {
    options = this.setDefaultOptions($.extend({
      contentType : 'application/json; charset=utf-8',
      data        : {},
      httpMethod  : 'POST'
    }, options || {}));
    options['jsonPath'] = options['jsonPath'] || ('/' + options.className);

    // if data is an object, serialize it into a JSON string in this format: {"ClassName": {...data...}}
    if(typeof options.data == 'object') {
      var jsonObject = {};
      jsonObject[options.className] = options.data;
      options.data = JSON.stringify(jsonObject);
    } else {
      // if its text, send it along as form data
      options.contentType = 'application/x-www-form-urlencoded';
    }

    $.ajax({
      cache       : false,
      contentType : options.contentType,
      data        : options.data,
      dataType    : 'json',
      type        : options.httpMethod,
      url         : jive.oc.baseUrl() + options.createUrl,

      success     : this._newObjectSuccessCallback(options),
      error       : options.error
    });
  },

  /**
   * Destroy a single OpenClient JSON object via Ajax
   *
   * @param {Object}     options             A javascript object that can override the default options
   */
  destroyObject: function(options) {
    options = this.setDefaultOptions($.extend({
      contentType : 'application/json; charset=utf-8',
      data        : {},
      httpMethod  : 'DELETE'
    }, options || {}));

    $.ajax({
      cache       : false,
      contentType : options.contentType,
      dataType    : 'json',
      type        : options.httpMethod,
      url         : jive.oc.baseUrl() + options.destroyUrl,

      success     : this._newObjectSuccessCallback(options),
      error       : options.error
    });
  },

  /**
   * Pseudo-private: Returns a function that will be used by $.ajax()
   * as the success callback in the other jive.oc utility methods.
   */
  _newObjectSuccessCallback: function(options) {
    return function(responseJSON, successCode, xhrObj) {
      // Grab object out of response JSON
      var object = $.jsonPathLite(responseJSON, options.jsonPath);

      if(object === true || object === false) { // if its a boolean, just return it
        options.success(object, successCode, xhrObj);
      } else if (options.multiple) {

        // If we find an array of objects at the path we expected
        if($.isArray(object)) {
          // Convert each JSON object into an instance of it's OpenClient class
          var objects = $.map(object, function(obj) { return new options.jsClass(obj); });

          // Execute the success callback with the objects
          options.success(objects, successCode, xhrObj);
        } else if (object === null) {
          // Our Java-based JSON encoder returns an empty string when given an empty array (WTF). It will look like {"ClassNameCollection" : ""}
          // If it is returned this way, the $.jsonPathLite call above will return null. In that case, lets return an empty array.
          options.success([], successCode, xhrObj);
        } else {
          // Our wonderful Java-based JSON encoder will return an array containing one object as just the object, without a containing array.
          // If that's the case, enclose it in an array and return it.
          options.success([object], successCode, xhrObj);
        }

      } else if(object !== null) { // if its an object, instantiate an instance of the class and return that
        options.success(new options.jsClass(object), successCode, xhrObj);
      } else { // otherwise return the JSON directly
        options.success(responseJSON, successCode, xhrObj);
      }
    };
  }

});


/********** core/Activity.js **********/

/**
 * jive.oc.Activity
 *
 * Interface to OpenClient Activity REST API
 * @class
 */
jive.oc.Activity = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Activity, {
  /** @lends jive.oc.Activity */

  /**
   * Find multiple activities.
   *
   * @param {Integer|String}   id        Ignored. Always returns all activities.
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    options = $.extend({
      className : 'Activity',
      findUrl   : '/activities',
      jsonPath  : '/ActivityCollection/Activities'
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all activities for a user
   *
   * @param {Integer}   userId    Unique id of the user these activities belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/activities/users/' + userId}, options || {}));
  },

  /**
   * Find all activities for a user's connections
   *
   * @param {Integer}   userId    Unique id of the user whose connnections these activities belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForConnectionsByUserId: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/activities/users/' + userId + '/connections'}, options || {}));
  },

  /**
   * Find all activities for a user's colleagues
   *
   * @param {Integer}   userId    Unique id of the user whose colleagues these activities belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForColleaguesByUserId: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/activities/users/' + userId + '/colleagues'}, options || {}));
  },

  /**
   * Find all activities in a space
   *
   * @param {Integer}   spaceId   Unique id of the space these activities belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this.find('all', $.extend({findUrl: '/activities/in/' + jive.oc.containers.space.ID + '/' + spaceId}, options || {}));
  },

  /**
   * Find all activities in a group
   *
   * @param {Integer}   groupId   Unique id of the group these activities belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this.find('all', $.extend({findUrl: '/activities/in/' + jive.oc.containers.group.ID + '/' + groupId}, options || {}));
  },

  /**
   * Find all activities in a project
   *
   * @param {Integer}   projectId   Unique id of the project these activities belong to
   * @param {Object}    options     Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this.find('all', $.extend({findUrl: '/activities/in/' + jive.oc.containers.project.ID + '/' + projectId}, options || {}));
  }

});


/********** core/Avatar.js **********/

/**
 * jive.oc.Avatar
 *
 * Interface to OpenClient Avatar REST API
 * @class
 */
jive.oc.Avatar = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Avatar, {
  /** @lends jive.oc.Avatar */

  /**
   * Find one avatar
   *
   * @param {Integer}   id        Unique id of the Avatar
   * @param {Object}    options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    options = $.extend({
      className : 'Avatar',
      findUrl   : '/avatars/' + id
    }, options || {});

    return jive.oc.getObject(options);
  }

});


/********** core/Blog.js **********/

/**
 * jive.oc.Blog
 *
 * Interface to OpenClient Blog REST API
 * @class
 */
jive.oc.Blog = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);

  /**
   * Find this blog's blogPosts
   *
   * @example
   * blog.blogPosts.find('all', {
   *   success: function(blogPosts) {
   *     // do something with the blogPosts...
   *   },
   *   error: function(response) {...}
   * });
   */
  this.blogPosts = {find: function(id, options) {
    var findUrl = "";
    if(id == 'all') {
      findUrl = '/blogs/' + that.ID + '/blogposts';
    } else {
      findUrl = '/blogposts/' + id; // can't guarantee post belongs to this blog, but it will find it
    }

    options = $.extend({"findUrl": findUrl}, options || {});
    return jive.oc.BlogPost.find(id, options || {});
  }};
};

$.extend(jive.oc.Blog, {
  /** @lends jive.oc.Blog */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, options) {
    options = $.extend({
      className: 'Blog',
      findUrl:   findUrl
    }, options || {});

    return jive.oc.getObject(options);
  },

  /**
   * Find a blog by its id
   *
   * @param {Integer} id Unique id of the blog to find
   * @param {Object} options Standard jive.oc ajax options
   */
  find: function(id, options) {
    return this._find('/blogs/' + id, options || {});
  },

  /**
   * Find a blog for a user given a userId
   *
   * @param {Integer} userId Unique id of the user this blog belongs to
   * @param {Object} options Standard jive.oc ajax options
   */
  findByUserId: function(userId, options) {
    // TODO: change findUrl to '/users/{userId}/blog' once Adam W makes change
    return this._find('/blogs/users/' + userId, options || {});
  },

  /**
   * Find a blog for a group given a groupId
   *
   * @param {Integer} groupId Unique id of the group this blog belongs to
   * @param {Object} options Standard jive.oc ajax options
   */
  findByGroupId: function(groupId, options) {
    // TODO: change findUrl to '/groups/{groupId}/blog' once Adam W makes change
    return this._find('/blogs/in/' + jive.oc.containers.group.ID + '/' + groupId, options || {});
  },

  /**
   * Find a blog for a project given a projectId
   *
   * @param {Integer} projectId Unique id of the project this blog belongs to
   * @param {Object} options Standard jive.oc ajax options
   */
  findByProjectId: function(projectId, options) {
    // TODO: change findUrl to '/projects/{projectId}/blog' once Adam W makes change
    return this._find('/blogs/in/' + jive.oc.containers.project.ID + '/' + projectId, options || {});
  },

  /**
   * Find a blog for a space given a spaceId
   *
   * @param {Integer} spaceId Unique id of the space this blog belongs to
   * @param {Object} options Standard jive.oc ajax options
   */
  findBySpaceId: function(spaceId, options) {
    // TODO: change findUrl to '/spaces/{spaceId}/blog' once Adam W makes change
    return this._find('/blogs/in/' + jive.oc.containers.space.ID + '/' + spaceId, options || {});
  }

});


/********** core/BlogPost.js **********/

/**
 * jive.oc.BlogPost
 *
 * Interface to OpenClient BlogPost REST API
 * @class
 */
jive.oc.BlogPost = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.BlogPost, {
  /** @lends jive.oc.BlogPost */

  /**
   * Find one or multiple BlogPosts.
   *
   * @param {Integer|String}   id        Unique id of the blog post, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'BlogPost'}, options || {}));
  },

  /**
   * Find all recent blog posts that belong to a particular blog
   *
   * @param {Integer}   blogId    Unique id of the blog these blog posts belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByBlogId: function(blogId, options) {
    return this.find('all', $.extend({
      findUrl: '/blogs/' + blogId + '/blogposts'
    }, options || {}));
  },

  /**
   * Find all recent blog posts that belong to a particular user
   *
   * @param {Integer}   userId    Unique id of the user these blog posts belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userId, options) {
    return this.find('all', $.extend({
      findUrl: '/blogposts/users/' + userId
    }, options || {}));
  },

  /**
   * Find all blog posts that belong to a particular group
   *
   * @param {Integer}   groupId    Unique id of the group these blog posts belong to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this.find('all', $.extend({
      // TODO: change findUrl to '/groups/{groupId}/blog/blogposts' once Adam W makes change
      findUrl: '/blogposts/in/' + jive.oc.containers.group.ID + '/' + groupId
    }, options || {}));
  },

  /**
   * Find all blog posts that belong to a particular project
   *
   * @param {Integer}   projectId    Unique id of the project these blog posts belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this.find('all', $.extend({
      // TODO: change findUrl to '/projects/{projectId}/blog/blogposts' once Adam W makes change
      findUrl: '/blogposts/in/' + jive.oc.containers.project.ID + '/' + projectId
    }, options || {}));
  },

  /**
   * Find all blog posts that belong to a particular space
   *
   * @param {Integer}   spaceId    Unique id of the space these blog posts belong to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this.find('all', $.extend({
      // TODO: change findUrl to '/spaces/{spaceId}/blog' once Adam W makes change
      findUrl: '/blogposts/in/' + jive.oc.containers.space.ID + '/' + spaceId
    }, options || {}));
  },

  /**
   * Create a new blog post that belongs to a particular blog
   *
   * @param {Object}    options                   Standard jive.oc ajax options
   * @param {Object}    options.data              The data attributes of the blog post
   * @param {String}    options.data.subject      The subject of the blog post
   * @param {String}    options.data.htmlBody     The body text of this blog post in HTML format
   * @param {Integer}   options.data.userID       The user id of the user creating this blog post. (necessary?)
   * @param {Boolean}   options.data.draft        Whether this blog post should be a draft
   * @param {Array}     options.data.categories   Array of category strings this blog post should belong to
   * @param {Integer}   options.data.blogID       The blog this blog post should belong to
   */
  create: function(options) {
    options    = $.extend({
      className : 'BlogPost'
    }, options || {});
    options.data = $.extend({blogID: -1}, options.data || {});
    options.createUrl = '/blogs/' + options.data.blogID;

    return jive.oc.createObject(options);
  }
});


/********** core/Category.js **********/

/**
 * jive.oc.Category
 *
 * Interface to OpenClient Category REST API
 * @class
 */
jive.oc.Category = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Category, {
  /** @lends jive.oc.Category */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, options) {
    options = $.extend({
      className : 'Category',
      findUrl   : findUrl,
      jsonPath  : '/CategoryCollection/Categories'
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all categories of a space
   *
   * @param {Integer}   spaceId   Unique id of the space these categories belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this._find('/categories/spaces/' + spaceId, options || {});
  },

  /**
   * Find all categories of a group
   *
   * @param {Integer}   groupId   Unique id of the group these categories belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this._find('/categories/groups/' + groupId, options || {});
  },

  /**
   * Find all categories of a project
   *
   * @param {Integer}   projectId   Unique id of the project these categories belong to
   * @param {Object}    options     Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this._find('/categories/projects/' + projectId, options || {});
  },

  /**
   * Find all categories of a user
   *
   * @param {Integer}   documentId   Unique id of the document these categories belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByDocumentId: function(documentId, options) {
    return this._find('/categories/documents/' + documentId, options || {});
  },

  /**
   * Find all categories of a blog post
   *
   * @param {Integer}   blogPostId   Unique id of the blog post these categories belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByBlogPostId: function(blogPostId, options) {
    return this._find('/categories/blogposts/' + blogPostId, options || {});
  },

  /**
   * Find all categories of a thread
   *
   * @param {Integer}   threadId   Unique id of the thread these categories belong to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllByThreadId: function(threadId, options) {
    return this._find('/categories/threads/' + threadId, options || {});
  }

});


/********** core/Comment.js **********/

/**
 * jive.oc.Comment
 *
 * Interface to OpenClient Comment REST API
 * @class
 */
jive.oc.Comment = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Comment, {
  /** @lends jive.oc.Comment */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, jsonPath, options) {
    options = $.extend({
      className : 'Comment',
      findUrl   : findUrl,
      jsonPath  : jsonPath
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all comments on a blog post
   *
   * @param {Integer}   blogPostId   Unique id of the blog post these comments belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByBlogPostId: function(blogPostId, options) {
    return this._find('/blogposts/' + blogPostId + '/comments', '/BlogPost/Comments', options || {});
  },

  /**
   * Find all comments on a document
   *
   * @param {Integer}   documentId   Unique id of the document these comments belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByDocumentId: function(documentId, options) {
    return this._find('/documents/' + documentId + '/comments', '/Document/Comments', options || {});
  },

  /**
   * Create a new comment
   *
   * @param {Object}    options                   Standard jive.oc ajax options
   * @param {Object}    options.data              The data attributes of the comment
   * @param {String}    options.data.body         The body text of the comment
   * @param {Integer}   options.data.documentID   The document this comment relates to (use either this or blogPostID)
   * @param {Integer}   options.data.blogPostID   The blog post this comment relates to (use either this or documentID)
   */
  create: function(options) {
    options    = $.extend({
      className : 'Comment'
    }, options || {});

    if(options.data.blogPostID) {
      options.createUrl = '/blogposts/' + options.data.blogPostID + '/comments';
    } else if (options.data.documentID) {
      options.createUrl = '/documents/' + options.data.documentID + '/comments';
    }

    // TODO: creating comments is different than most other OpenClient REST services in that
    // it expects form data instead of a JSON object. Remove this once this is made consistent.
    options.data = "comment=" + escape(options.data.body);

    // TODO: this is a workaround for a server-side bug. remove once Adam fixes it.
    // It is not accepting the comment in the POST parameters, only query string currently. SMB 4/27/2010
    options.createUrl += "?" + options.data;

    return jive.oc.createObject(options);
  }

});


/********** core/Document.js **********/

/**
 * jive.oc.Document
 *
 * Interface to OpenClient Document REST API
 * @class
 */
jive.oc.Document = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Document, {
  /** @lends jive.oc.Document */

  /**
   * Find one or multiple documents
   *
   * @param {Integer|String}   id        Unique id of the document or the string 'all'
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'Document'}, options || {}));
  },

  /**
   * Find all documents for a user
   *
   * @param {Integer}   userId    Unique id of the user these documents belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/documents/users/' + userId}, options || {}));
  },

  /**
   * Find all documents for a space
   *
   * @param {Integer}   spaceId   Unique id of the space these documents belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this.find('all', $.extend({findUrl: '/documents/in/' + jive.oc.containers.space.ID + '/' + spaceId}, options || {}));
  },

  /**
   * Find all documents for a group
   *
   * @param {Integer}   groupId   Unique id of the group these documents belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this.find('all', $.extend({findUrl: '/documents/in/' + jive.oc.containers.group.ID + '/' + groupId}, options || {}));
  },

  /**
   * Find all documents for a project
   *
   * @param {Integer}   projectId    Unique id of the project these documents belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this.find('all', $.extend({findUrl: '/documents/in/' + jive.oc.containers.project.ID + '/' + projectId}, options || {}));
  },

  /**
   * Create a new document
   *
   * @param {Object}     options                      Standard jive.oc ajax options
   * @param {Object}     options.data                 The data attributes of the document
   * @param {Integer}    options.data.containerType   Either jive.oc.containers.group.ID, jive.oc.containers.space.ID or jive.oc.containers.project.ID
   * @param {Integer}    options.data.containerID     The unique id of the container (group, project or space)
   * @param {String}     options.data.subject         The subject of the document
   * @param {String}     options.data.htmlBody        The body of the document in HTML format.
   * @param {Array}      options.data.categories      Array of category strings this blog post should belong to
   * @param {Boolean}    options.data.draft           Whether this document is a draft.
   */
  create: function(options) {
    options    = $.extend({
      className : 'Document',
      createUrl : '/documents'
    }, options || {});
    options.data = options.data || {};

    return jive.oc.createObject(options);
  }

});


/********** core/Group.js **********/

/**
 * jive.oc.Group
 *
 * Interface to OpenClient Group REST API
 * @class
 */
jive.oc.Group = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Group, {
  /** @lends jive.oc.Group */

  /**
   * Find one or multiple groups
   *
   * @param {Integer|String}   id        Unique id of the group, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'Group'}, options || {}));
  }

});


/********** core/Like.js **********/

/**
 * jive.oc.Like
 *
 * Interface to OpenClient Like REST API
 * @class
 */
jive.oc.Like = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Like, {
  /** @lends jive.oc.Like */

  /**
   * Psuedo-private: sets default options className, createUrl, httpMethod, and jsClass for jive.oc.createObject, 
   * depending on which associated content id is passed in (microblogID, documentID, etc...)
   *
   * @param {String}   mode      Either 'create' or 'destroy'
   * @param {Object}   options   Standard jive.oc ajax options
   *
   * @example
   *   var options = {microblogID: 1};
   *   this._setDefaultOptions('create', options);
   *
   *   // Returns:
   *   {
   *     microblogID : 1,
   *     className   : 'Microblog',
   *     createUrl   : '/like/microblogs/1',
   *     httpMethod  : 'PUT',
   *     jsClass     : jive.oc.microblog
   *   }
   *
   */
  _setDefaultOptions: function(mode, options) {
    var basePath = mode == 'create' ? '/like' : '/unlike';

    options = $.extend({}, options || {});
    options.httpMethod = 'PUT';

    if (options.blogPostID) {
      options.className = 'BlogPost';
      options.createUrl = basePath + '/blogposts/' + options.blogPostID;
    } else if (options.commentID) {
      options.className = 'Comment';
      options.createUrl = basePath + '/comments/' + options.commentID;
    } else if (options.documentID) {
      options.className = 'Document';
      options.createUrl = basePath + '/documents/' + options.documentID;
    } else if (options.messageID) {
      options.className = 'Message';
      options.createUrl = basePath + '/messages/' + options.messageID;
    } else if (options.microblogID) {
      options.className = 'Microblog';
      options.createUrl = basePath + '/microblogs/' + options.microblogID;
    } else if (options.threadID) {
      options.className = 'Thread';
      options.createUrl = basePath + '/threads/' + options.threadID;
    }

    return options;
  },

  /**
   * Like a peice of content.
   *
   * @param {Object}     options               Standard jive.oc ajax options
   * @param {Integer}    options.microblogID   The unique id of a microblog to like
   * @param {Integer}    options.documentID    The unique id of a document to like
   * @param {Integer}    options.blogPostID    The unique id of a blog post to like
   * @param {Integer}    options.threadID      The unique id of a thread to like
   * @param {Integer}    options.messageID     The unique id of a message to like
   * @param {Integer}    options.commentID     The unique id of a comment to like
   *
   * @example
   *   jive.oc.Like.create({microblogID: 1, success: yourCallbackHere})
   *   jive.oc.Like.create({documentID: 1, success: yourCallbackHere})
   *   jive.oc.Like.create({blogPostID: 1, success: yourCallbackHere})
   *   jive.oc.Like.create({threadID: 1, success: yourCallbackHere})
   *   jive.oc.Like.create({messageID: 1, success: yourCallbackHere})
   *   jive.oc.Like.create({commentID: 1, success: yourCallbackHere})
   *
   */
  create: function(options) {
    options = this._setDefaultOptions('create', options);
    return jive.oc.createObject(options);
  },

  /**
   * Unlike a peice of content
   *
   * @param {Object}     options               Standard jive.oc ajax options
   * @param {Integer}    options.microblogID   The unique id of a microblog to unlike
   * @param {Integer}    options.documentID    The unique id of a document to unlike
   * @param {Integer}    options.blogPostID    The unique id of a blog post to unlike
   * @param {Integer}    options.threadID      The unique id of a thread to unlike
   * @param {Integer}    options.messageID     The unique id of a message to unlike
   * @param {Integer}    options.commentID     The unique id of a comment to unlike
   *
   * @example
   *   jive.oc.Like.destroy({microblogID: 1, success: yourCallbackHere})
   *   jive.oc.Like.destroy({documentID: 1, success: yourCallbackHere})
   *   jive.oc.Like.destroy({blogPostID: 1, success: yourCallbackHere})
   *   jive.oc.Like.destroy({threadID: 1, success: yourCallbackHere})
   *   jive.oc.Like.destroy({messageID: 1, success: yourCallbackHere})
   *   jive.oc.Like.destroy({commentID: 1, success: yourCallbackHere})
   *
   */
  destroy: function(options) {
    options = this._setDefaultOptions('destroy', options);
    return jive.oc.createObject(options);
  }

});


/********** core/Mention.js **********/

/**
 * jive.oc.Mention
 *
 * Interface to OpenClient Mention REST API
 * @class
 */
jive.oc.Mention = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Mention, {
  /** @lends jive.oc.Mention */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, options) {
    options = $.extend({
      className : 'Mention',
      findUrl   : findUrl,
      jsonPath  : '/ActivityCollection/Activities'
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all mentions of a user
   *
   * @param {Integer}   userId    Unique id of the user these mentions belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userId, options) {
    return this._find('/mentions/users/' + userId, options || {});
  },

  /**
   * Find all mentions of a user's connections
   *
   * @param {Integer}   userId    Unique id of the user whose connections these mentions belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForConnectionsByUserId: function(userId, options) {
    return this._find('/mentions/users/' + userId + '/connections', options || {});
  },

  /**
   * Find all mentions of a user's colleagues
   *
   * @param {Integer}   userId    Unique id of the user whose colleagues these mentions belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForColleaguesByUserId: function(userId, options) {
    return this._find('/mentions/users/' + userId + '/colleagues', options || {});
  },

  /**
   * Find all mentions of a group
   *
   * @param {Integer}   groupId    Unique id of the group these mentions belong to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this._find('/mentions/groups/' + groupId, options || {});
  },

  /**
   * Find all mentions of a project
   *
   * @param {Integer}   projectId    Unique id of the project these mentions belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this._find('/mentions/projects/' + projectId, options || {});
  },

  /**
   * Find all mentions of a space
   *
   * @param {Integer}   spaceId    Unique id of the space these mentions belong to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this._find('/mentions/spaces/' + spaceId, options || {});
  },

  /**
   * Find all mentions of a document
   *
   * @param {Integer}   documentId    Unique id of the document these mentions belong to
   * @param {Object}    options       Standard jive.oc ajax options
   */
  findAllByDocumentId: function(documentId, options) {
    return this._find('/mentions/documents/' + documentId, options || {});
  },

  /**
   * Find all mentions of a thread
   *
   * @param {Integer}   threadId    Unique id of the thread these mentions belong to
   * @param {Object}    options     Standard jive.oc ajax options
   */
  findAllByThreadId: function(threadId, options) {
    return this._find('/mentions/threads/' + threadId, options || {});
  },

  /**
   * Find all mentions of a blog post
   *
   * @param {Integer}   blogPostId    Unique id of the blog post these mentions belong to
   * @param {Object}    options       Standard jive.oc ajax options
   */
  findAllByBlogPostId: function(blogPostId, options) {
    return this._find('/mentions/blogposts/' + blogPostId, options || {});
  }

});


/********** core/Message.js **********/

/**
 * jive.oc.Message
 *
 * Interface to OpenClient Message REST API
 * @class
 */
jive.oc.Message = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Message, {
  /** @lends jive.oc.Message */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(id, options) {
    options = $.extend({
      className : 'Message',
      findUrl   : '/threads/messages'
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all reply messages that belong to a thread
   *
   * @param {Integer}   threadId    Unique id of the thread these replies belong to
   * @param {Object}    options     Standard jive.oc ajax options
   */
  findRepliesByThreadId: function(threadId, options) {
    return this._find('all', $.extend({findUrl: '/threads/' + threadId + '/messages', jsonPath: 'Thread/Messages'}, options || {}));
  },

  /**
   * Find all child messages that belong to a message
   *
   * @param {Integer}   messageId    Unique id of the message these children belong to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findChildrenByMessageId: function(messageId, options) {
    return this._find('all', $.extend({findUrl: '/threads/messages/' + messageId + '/children'}, options || {}));
  },

  /**
   * Create a new message in response to another message
   *
   * @param {Object}    options                 Standard jive.oc ajax options
   * @param {Object}    options.data            The data attributes of the message
   * @param {String}    options.data.subject    The subject of the message
   * @param {String}    options.data.htmlBody   The body of the message in HTML format
   */
  create: function(options) {
    options    = $.extend({
      className : 'Message',
      messageID : -1 // id of message to reply to
    }, options || {});
    options.data = $.extend({associationID: -1}, options.data || {});
    options.createUrl = options.createUrl || ('/threads/messages/' + options.messageID);

    return jive.oc.createObject(options);
  }

});


/********** core/Microblog.js **********/

/**
 * jive.oc.Microblog
 *
 * Interface to OpenClient Microblog REST API
 * @class
 */
jive.oc.Microblog = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Microblog, {
  /** @lends jive.oc.Microblog */

  /**
   * Find one or multiple microblogs
   *
   * @param {Integer|String}   id        Unique id of the microblog, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    var url = '/microblogs';
    url += (id == 'all' ? '' : '/' + id);
    url += '?brevity=HTMLAndText';
    return jive.oc.getObjectOrCollection(id, $.extend({findUrl: url, className: 'Microblog'}, options || {}));
  },

  /**
   * Find all microblogs for a user
   *
   * @param {Integer}   userId    Unique id of the user these microblogs belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userID, options) {
    return this.find('all', $.extend({findUrl: '/microblogs/users/' + userID + '?brevity=HTMLAndText'}, options || {}));
  },

  /**
   * Find all microblogs for a user's colleagues
   *
   * @param {Integer}   userId    Unique id of the user whose colleagues these microblogs belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForColleaguesByUserId: function(userID, options) {
    return this.find('all', $.extend({findUrl: '/microblogs/users/' + userID + '/colleagues' + '?brevity=HTMLAndText'}, options || {}));
  },

  /**
   * Find all microblogs for a user's connections
   *
   * @param {Integer}   userId    Unique id of the user whose connnections these microblogs belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllForConnectionsByUserId: function(userID, options) {
    return this.find('all', $.extend({findUrl: '/microblogs/users/' + userID + '/connections' + '?brevity=HTMLAndText'}, options || {}));
  },

  /**
   * Create a new microblog
   *
   * @param {Object}    options                  Standard jive.oc ajax options
   * @param {Object}    options.data             The data attributes of the micro blog
   * @param {Float}     options.data.latitude    The user's location latitude in degrees. Ex: 45.417732
   * @param {Float}     options.data.longitude   The user's location longitude in degrees. Ex: -122.459106
   * @param {String}    options.data.htmlBody    The body of the microblog in HTML format.
   * @param {Boolean}   options.data.draft       Whether this microblog is a draft.
   */
  create: function(options) {
    options    = $.extend({
      className  : 'Microblog'
    }, options || {});
    options.data      = options.data || {};

    if(!options.createUrl) {
      options.createUrl  = '/microblogs';
    }

    return jive.oc.createObject(options);
  }

});


/********** core/Profile.js **********/

/**
 * jive.oc.Profile
 *
 * Interface to OpenClient Profile REST API
 * @class
 */
jive.oc.Profile = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Profile, {
  /** @lends jive.oc.Profile */

  /**
   * Find the profile of the specified user
   *
   * @param {Integer}   userId    Unique id of the user this profile belongs to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findByUserId: function(userId, options) {
    options = $.extend({
      className : 'Profile',
      findUrl   : '/profiles/' + userId
    }, options || {});
    return jive.oc.getObject(options);
  }

  // Disabled findImageByUserId() because images are now returned directly, instead of JSON encoded.

  // /**
  //  * findImageByUserId(userId, options)
  //  *
  //  * Find the profile image of the specified user
  //  */
  // findImageByUserId: function(userId, options) {
  //   options = $.extend({
  //     className: 'ProfileImage'
  //   }, options || {});
  //   return jive.oc.getObject($.extend({findUrl: '/profiles/' + userId + '/image'}, options));
  // }

});


/********** core/Project.js **********/

/**
 * jive.oc.Project
 *
 * Interface to OpenClient Project REST API
 * @class
 */
jive.oc.Project = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Project, {
  /** @lends jive.oc.Project */

  /**
   * Find one or multiple projects
   *
   * @param {Integer|String}   id        Unique id of the project, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'Project'}, options || {}));
  }

});


/********** core/RecentContent.js **********/

/**
 * jive.oc.RecentContent
 *
 * Interface to OpenClient RecentContent REST API
 * @class
 */
jive.oc.RecentContent = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.RecentContent, {
  /** @lends jive.oc.RecentContent */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, options) {
    options = $.extend({
      className : 'RecentContent',
      jsonPath  :  '/RecentContent/ContentObjects',
      findUrl   : findUrl
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find all recent content for a group
   *
   * @param {Integer}   groupId    Unique id of the group this recent content belongs to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this._find('/recentcontent/groups/' + groupId, options || {});
  },

  /**
   * Find all recent content for a project
   *
   * @param {Integer}   projectId    Unique id of the project this recent content belongs to
   * @param {Object}    options      Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this._find('/recentcontent/projects/' + projectId, options || {});
  },

  /**
   * Find all recent content for a space
   *
   * @param {Integer}   spaceId    Unique id of the space this recent content belongs to
   * @param {Object}    options    Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this._find('/recentcontent/spaces/' + spaceId, options || {});
  }

});


/********** core/Relationship.js **********/

/**
 * jive.oc.Relationship
 *
 * Interface to OpenClient Relationship REST API
 * @class
 */
jive.oc.Relationship = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Relationship, {
  /** @lends jive.oc.Relationship */

  /**
   * Determine if current user is following the passed in user
   *
   * @param {Integer}   userId    Unique id of the user in question
   * @param {Object}    options   Standard jive.oc ajax options
   */
  isFollowing: function(userId, options) {
    jive.oc.getObject($.extend({findUrl: '/relationships/' + userId, jsonPath: '/isFollowing'}, options));
  },

  /**
   * Create a new relationship between the current user and the passed in user id (follow them)
   *
   * @param {Integer}   userId    Unique id of the user to follow
   * @param {Object}    options   Standard jive.oc ajax options
   */
  create: function(userId, options) {
    options = $.extend({
      className  : 'Relationship',
      createUrl  : '/relationships/' + userId,
      httpMethod : 'PUT',
      jsonPath   : '/isFollowing'
    }, options || {});

    return jive.oc.createObject(options);
  },

  /**
   * Destroy an existing relationship between the current user and the passed in user id (unfollow)
   *
   * @param {Integer}   userId    Unique id of the user to unfollow
   * @param {Object}    options   Standard jive.oc ajax options
   */
  destroy: function(userId, options) {
    options = $.extend({
      className  : 'Relationship',
      destroyUrl : '/relationships/' + userId,
      jsonPath   : '/isFollowing'
    }, options || {});

    return jive.oc.destroyObject(options);
  }

});


/********** core/Search.js **********/

/**
 * jive.oc.Search
 *
 * Interface to OpenClient Search REST API
 * @class
 */
jive.oc.Search = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Search, {
  /** @lends jive.oc.Search */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(findUrl, options) {
    options = $.extend({
      className : 'Search',
      findUrl   : findUrl
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Find places that match the query parameter
   *
   * @param {String}   query      String to search for
   * @param {Object}   options    Standard jive.oc ajax options
   */
  searchPlaces: function(query, options) {
    this._find('/search/places/' + query, $.extend({jsonPath: '/SearchResults/Places'}, options || {}));
  },

  /**
   * Find users that match the query parameter
   *
   * @param {String}   query      String to search for
   * @param {Object}   options    Standard jive.oc ajax options
   */
  searchUsers: function(query, options) {
    this._find('/search/users/' + query, $.extend({jsonPath: '/SearchResults/Users'}, options || {}));
  },

  /**
   * Searches the main lucene index for users, places, and/or content -
   * any or all of those types as specified, by the query object
   *
   * @param {Object}    options                       Standard jive.oc ajax options
   * @param {Object}    options.data                  Search options
   * @param {String}    options.data.query            String to search for
   * @param {Boolean}   options.data.users            Whether to search for users
   * @param {Boolean}   options.data.places           Whether to search for places
   * @param {Boolean}   options.data.contentObjects   Whether to search for content objects
   */
  search: function(options) {
    options    = $.extend({
      className : 'Search',
      createUrl : '/search',
      jsonPath  : '/SearchResults/Results',
      multiple  : true
    }, options || {});

    options.data = $.extend({
      query          : "",
      users          : true,
      places         : true,
      contentObjects : true
    }, options.data || {});

    return jive.oc.createObject(options);
  }

});


/********** core/Space.js **********/

/**
 * jive.oc.Space
 *
 * Interface to OpenClient Space REST API
 * @class
 */
jive.oc.Space = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Space, {
  /** @lends jive.oc.Space */

  /**
   * Find one or multiple spaces
   *
   * @param {Integer|String}   id        Unique id of the space, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'Space'}, options || {}));
  },

  /**
   * Find all sub-communities of parent community
   *
   * @param {Integer|String}   id        Unique id of the space, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  findChildren: function(id, options) {
    return this.find('all', $.extend({findUrl: '/spaces/' + id + '/children'}, options || {}));
  }

});


/********** core/Tag.js **********/

/**
 * jive.oc.Tag
 *
 * Interface to OpenClient Tag REST API
 * @class
 */
jive.oc.Tag = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Tag, {
  /** @lends jive.oc.Tag */

  /**
   * Pseudo-private: internal find function, sets default options
   */
  _find: function(id, options) {
    options = $.extend({
      className : 'Tag',
      findUrl   : '/tags'
    }, options || {});

    return jive.oc.getCollection(options);
  },

  /**
   * Search for tags that begin with or match query parameter
   *
   * @param {String}    query     Search string.
   * @param {Object}    options   Standard jive.oc ajax options
   */
  search: function(query, options) {
    return this._find('all', $.extend({findUrl: '/tags/search?query=' + encodeURIComponent(query) + '*'}, options || {}));
  },

  /**
   * Create a new tag
   *
   * @param {Object}    options             Standard jive.oc ajax options
   * @param {Object}    options.data        The data attributes of the tag
   * @param {String}    options.data.name   The name of the tag. Example: "foo"
   */
  create: function(options) {
    options    = $.extend({
      className  : 'Tag',
      httpMethod : 'PUT'
    }, options || {});
    options.data = $.extend({name: null}, options.data || {});
    options.createUrl = '/tags/create/' + options.data.name;

    return jive.oc.createObject(options);
  }

});


/********** core/Thread.js **********/

/**
 * jive.oc.Thread
 *
 * Interface to OpenClient Thread REST API
 * @class
 */
jive.oc.Thread = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);
};

$.extend(jive.oc.Thread, {
  /** @lends jive.oc.Thread */

  /**
   * Find one or multiple Threads
   *
   * @param {Integer|String}   id        Unique id of the thread, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'Thread'}, options || {}));
  },

  /**
   * Find all recent threads in a space
   *
   * @param {Integer}   spaceId   Unique id of the space these threads belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllBySpaceId: function(spaceId, options) {
    return this.find('all', $.extend({findUrl: '/threads/in/' + jive.oc.containers.space.ID + '/' + spaceId}, options || {}));
  },

  /**
   * Find all recent threads in a project
   *
   * @param {Integer}   projectId   Unique id of the project these threads belong to
   * @param {Object}    options     Standard jive.oc ajax options
   */
  findAllByProjectId: function(projectId, options) {
    return this.find('all', $.extend({findUrl: '/threads/in/' + jive.oc.containers.project.ID + '/' + projectId}, options || {}));
  },

  /**
   * Find all recent threads in a group
   *
   * @param {Integer}   groupId   Unique id of the group these threads belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByGroupId: function(groupId, options) {
    return this.find('all', $.extend({findUrl: '/threads/in/' + jive.oc.containers.group.ID + '/' + groupId}, options || {}));
  },

  /**
   * Find all recent threads that have been participated in by a user
   *
   * @param {Integer}   userId    Unique id of the user these threads belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findAllByUserId: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/threads/users/' + userId}, options || {}));
  },

  /**
   * Create a new thread
   *
   * @param {Object}     options                                  Standard jive.oc ajax options
   * @param {Object}     options.data                             The data attributes of the document
   * @param {Integer}    options.data.rootMessage                 The root message for this thread.
   * @param {Integer}    options.data.rootMessage.containerType   Either jive.oc.containers.group.ID, jive.oc.containers.space.ID or jive.oc.containers.project.ID
   * @param {Integer}    options.data.rootMessage.containerID     The unique id of the container (group, project or space)
   * @param {String}     options.data.rootMessage.subject         The subject of the root message
   * @param {String}     options.data.rootMessage.body            The body of the root message.
   * @param {Array}      options.data.categories                  Array of category strings this blog post should belong to
   * @param {Boolean}    options.data.question                    Whether this thread is a question.
   */
  create: function(options) {
    options    = $.extend({
      className : 'Thread',
      createUrl : '/threads'
    }, options || {});
    options.data = options.data || {};

    return jive.oc.createObject(options);
  }

});


/********** core/User.js **********/

/**
 * jive.oc.User
 *
 * Interface to OpenClient Users REST API
 * @class
 */
jive.oc.User = function(jsonResponse) {
  var that = this;
  $.extend(this, jsonResponse);

  /**
   * Find a user's blog
   *
   * @example
   * user.blog.find({
   *   success: function(blog) {
   *     // do something with the user's blog...
   *   },
   *   error: function(response) {...}
   * });
   *
   */
  this.blog = {find: function(options) {
    return jive.oc.Blog.find(that.blogID, options);
  }};

  /**
   * Find all of a user's connections
   *
   * @example
   * user.connections.find({success: function(connections) {...}, ...})
   */
  this.connections = {find: function(options) {
    return jive.oc.User.findConnections(that.ID, options);
  }};

  /**
   * Find all of a user's colleagues
   *
   * @example
   * user.colleagues.find({success: function(colleagues) {...}, ...})
   */
  this.colleagues = {find: function(options) {
    return jive.oc.User.findColleagues(that.ID, options);
  }};

};

$.extend(jive.oc.User, {
  /** @lends jive.oc.User */

  /**
   * Find all users or find one user by its id
   *
   * @param {Integer|String}   id        Unique id of the user, or the string "all"
   * @param {Object}           options   Standard jive.oc ajax options
   *
   * @example
   *   // find a single user
   *   var userId = 123;
   *   jive.oc.User.find(userId, {
   *
   *     success: function(user) {
   *       // set the innerText property of the "user_name" DOM element
   *       $("#user_name").text(user.name);
   *     }
   *   
   *   });
   *
   *   // find all users (paginated, defaults to the first 10)
   *   jive.oc.User.find('all', {
   *
   *     success: function(users) {
   *       // iterate through users array, using jQuery's each() method
   *       $.each(users, function(index, user) {
   *         console.log("The user's name is: " + user.name);
   *       });
   *     }
   *
   *   });
   */
  find: function(id, options) {
    return jive.oc.getObjectOrCollection(id, $.extend({className: 'User'}, options || {}));
  },

  /**
   * Find all of a user's connections
   *
   * @param {Integer}   userId    Unique id of the user these connections belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findConnections: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/users/' + userId + '/connections'}, options || {}));
  },

  /**
   * Find all of a user's colleagues
   *
   * @param {Integer}   userId    Unique id of the user these colleagues belong to
   * @param {Object}    options   Standard jive.oc ajax options
   */
  findColleagues: function(userId, options) {
    return this.find('all', $.extend({findUrl: '/users/' + userId + '/colleagues'}, options || {}));
  },

  /**
   * Find a user's id via their username
   *
   * @param {String}   username   Username of the user to look up
   * @param {Object}   options    Standard jive.oc ajax options
   */
  findIdByUsername: function(username, options) {
    return jive.oc.getObject($.extend({className: 'userID', jsClass: Number, findUrl: '/users/' + username + '/id'}, options || {}));
  }

});
