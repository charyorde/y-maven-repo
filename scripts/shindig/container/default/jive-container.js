
/*
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

// Default container configuration. To change the configuration, you have two options:
//
// A. If you run the Java server: Create your own "myContainer.js" file and
// modify the value in web.xml.
//
//  B. If you run the PHP server: Create a myContainer.js, copy the contents of container.js to it,
//  change
//		{"gadgets.container" : ["default"],
//  to
//		﻿{"gadgets.container" : ["myContainer"],
// And make your changes that you need to myContainer.js.
// Just make sure on the iframe URL you specify &container=myContainer
// for it to use that config.
//
// All configurations will automatically inherit values from this
// config, so you only need to provide configuration for items
// that you require explicit special casing for.
//
// Please namespace your attributes using the same conventions
// as you would for javascript objects, e.g. gadgets.features
// rather than "features".

// NOTE: Please _don't_ leave trailing commas because the php json parser
// errors out on this.

// Container must be an array; this allows multiple containers
// to share configuration.
{"gadgets.container" : ["default", "home"],

// Set of regular expressions to validate the parent parameter. This is
// necessary to support situations where you want a single container to support
// multiple possible host names (such as for localized domains, such as
// <language>.example.org. If left as null, the parent parameter will be
// ignored; otherwise, any requests that do not include a parent
// value matching this set will return a 404 error.
"gadgets.parent" : null,

// Should all gadgets be forced on to a locked domain?
"gadgets.lockedDomainRequired" : true,
"gadgets.uri.iframe.lockedDomainRequired" : true,

// DNS domain on which gadgets should render.
"gadgets.lockedDomainSuffix" : "-${jiveAppUrlSubdomainPrefix}${jiveAppSubdomainSeparator}${jiveAppUrlHost}${jiveAppUrlPort}",

// Origins for CORS requests and/or Referer validation
// Indicate a set of origins or an entry with * to indicate that all origins are allowed
"gadgets.parentOrigins" : ["${jiveContainerUrl}"],

// Various urls generated throughout the code base.
// iframeBaseUri will automatically have the host inserted
// if locked domain is enabled and the implementation supports it.
// query parameters will be added.
"gadgets.iframeBaseUri" : "${jiveAppUrl}/gadgets/ifr",

// jsUriTemplate will have %host% and %js% substituted.
// No locked domain special cases, but jsUriTemplate must
// never conflict with a lockedDomainSuffix.
"gadgets.jsUriTemplate" : "${jiveAppUrl}/gadgets/js/%js%",

//New configuration for iframeUri generation:
"gadgets.uri.iframe.lockedDomainSuffix" :  "-${jiveAppUrlSubdomainPrefix}${jiveAppSubdomainSeparator}${jiveAppUrlHost}${jiveAppUrlPort}",
"gadgets.uri.iframe.unlockedDomain" : "${jiveAppUrlAuthority}",
"gadgets.uri.iframe.basePath" : "${jiveAppUrlPath}/gadgets/ifr",
"gadgets.uri.iframe.alwaysAppendSecurityToken" : true,

"gadgets.uri.js.host" : "${jiveAppUrlSchemeAuthority}",
"gadgets.uri.js.path" : "${jiveAppUrlPath}/gadgets/js",

// Callback URL.  Scheme relative URL for easy switch between https/http.
"gadgets.uri.oauth.callbackTemplate" : "//%host%${jiveAppContext}/gadgets/oauthcallback",

// Use an insecure security token by default
"gadgets.securityTokenType" : "insecure",

// Config param to load Opensocial data for social
// preloads in data pipelining.  %host% will be
// substituted with the current host.
"gadgets.osDataUri" : "${jiveAppUrlBase}/social/rpc",

// Uncomment these to switch to a secure version
//
//"gadgets.securityTokenType" : "secure",
//"gadgets.securityTokenKeyFile" : "/path/to/key/file.txt",

// Rewritten by ContentRewriterUris
"gadgets.rewriteConcatBase": "${jiveAppUrlPath}/gadgets/concat?",
"gadgets.rewriteProxyBase": "${jiveAppUrlPath}/gadgets/proxy?container=default&url=",

// Authority (host:port without scheme) for the proxy and concat servlets.
"defaultShindigProxyConcatAuthority": "${jiveContainerUrlHost}${jiveContainerUrlPort}",

// Default concat Uri config; used for testing.
"gadgets.uri.concat.host" : "${Cur['defaultShindigProxyConcatAuthority']}",
"gadgets.uri.concat.path" : "${jiveAppUrlPath}/gadgets/concat",
"gadgets.uri.concat.js.splitToken" : "false",

// Default proxy Uri config; used for testing.
"gadgets.uri.proxy.host" : "${Cur['defaultShindigProxyConcatAuthority']}",
"gadgets.uri.proxy.path" : "${jiveAppUrlPath}/gadgets/proxy",

// This config data will be passed down to javascript. Please
// configure your object using the feature name rather than
// the javascript name.

// Only configuration for required features will be used.
// See individual feature.xml files for configuration details.
"gadgets.features" : {
  "core.io" : {
    // Note: /proxy is an open proxy. Be careful how you expose this!
    // Note: Here // is replaced with the current protocol http/https
        "proxyUrl" : "${jiveAppUrlBase}/gadgets/proxy?container=default&refresh=%refresh%&url=%url%%rewriteMime%",
        "jsonProxyUrl" : "${jiveAppUrlBase}/gadgets/makeRequest"
  },
  "views" : {
    "home" : {
      "isOnlyVisible" : false,
      "urlTemplate" : "${jiveAppUrl}/gadgets/home?{var}",
      "aliases": ["HOME"]
    },
    "canvas" : {
      "isOnlyVisible" : true,
      "urlTemplate" : "${jiveAppUrl}/gadgets/canvas?{var}",
      "aliases" : ["FULL_PAGE"]
    },
    "user-prefs" : {
      "isOnlyVisible" : true
    },
    "system-settings" : {
      "isOnlyVisible" : true
    },
    "about" : {
      "isOnlyVisible" : false
    },
    "embedded" : {
      "isOnlyVisible" : true
    },
    "default" : {
      "isOnlyVisible" : false,
      "urlTemplate" : "${jiveAppUrl}/gadgets/default?{var}",
      "aliases" : ["home", "canvas", "embedded"]
    }
  },
  "tabs": {
    "css" : [
      ".tablib_table {",
      "width: 100%;",
      "border-collapse: separate;",
      "border-spacing: 0px;",
      "empty-cells: show;",
      "font-size: 11px;",
      "text-align: center;",
    "}",
    ".tablib_emptyTab {",
      "border-bottom: 1px solid #676767;",
      "padding: 0px 1px;",
    "}",
    ".tablib_spacerTab {",
      "border-bottom: 1px solid #676767;",
      "padding: 0px 1px;",
      "width: 1px;",
    "}",
    ".tablib_selected {",
      "padding: 2px;",
      "background-color: #ffffff;",
      "border: 1px solid #676767;",
      "border-bottom-width: 0px;",
      "color: #3366cc;",
      "font-weight: bold;",
      "width: 80px;",
      "cursor: default;",
    "}",
    ".tablib_unselected {",
      "padding: 2px;",
      "background-color: #dddddd;",
      "border: 1px solid #aaaaaa;",
      "border-bottom-color: #676767;",
      "color: #000000;",
      "width: 80px;",
      "cursor: pointer;",
    "}",
    ".tablib_navContainer {",
      "width: 10px;",
      "vertical-align: middle;",
    "}",
    ".tablib_navContainer a:link, ",
    ".tablib_navContainer a:visited, ",
    ".tablib_navContainer a:hover {",
      "color: #3366aa;",
      "text-decoration: none;",
    "}"
    ]
  },
  "minimessage": {
      "css": [
        ".mmlib_table {",
        "width: 100%;",
        "font: 12px arial,sans-serif;",
        "background-color: #3982ca;",
        "border-collapse: separate;",
        "border-spacing: 0px;",
        "padding: 8px;",
        "color: #fff;",

      "}",
      ".mmlib_xlink {",
        "font: bold 12px arial,sans-serif;",
        "font-weight: bold;",
        "color: #e9f3ff;",
        "cursor: pointer;",
      "}"
     ]
  },
  "rpc" : {
    // Path to the relay file. Automatically appended to the parent
    // parameter if it passes input validation and is not null.
    // This should never be on the same host in a production environment!
    // Only use this for TESTING!
    "parentRelayUrl" : "/gadgets/ifpc.relay.html",

    "commSwf": "${jiveContainerUrl}/gadgets/xpc.swf",
    // If true, this will use the legacy ifpc wire format when making rpc
    // requests.
    "useLegacyProtocol" : false
  },
  // Skin defaults
  "skins" : {
    "properties" : {
      "BG_COLOR": "",
      "BG_IMAGE": "",
      "BG_POSITION": "",
      "BG_REPEAT": "",
      "FONT_COLOR": "",
      "ANCHOR_COLOR": ""
    }
  },
  "opensocial" : {
    // Path to fetch opensocial data from
    // Must be on the same domain as the gadget rendering server
    "path" : "${jiveAppUrlBase}/social/rpc",
    // Path to issue invalidate calls
    "invalidatePath" : "${jiveAppUrl}/gadgets/api/rpc",
    "domain" : "shindig",
    "enableCaja" : false,
    "supportedFields" : {
       "person" : ["id", {"name" : ["familyName", "givenName", "unstructured"]}, "emails", "thumbnailUrl", 
                   "profileUrl", "aboutMe", "hasApp", "photos", "jive_enabled"],
       "activity" : ["appId", "body", "bodyId", "externalId", "id", "mediaItems", "postedTime", "priority",
                     "streamFaviconUrl", "streamSourceUrl", "streamTitle", "streamUrl", "templateParams", "title",
                     "url", "userId"],
       "activityEntry" : ["actor", "content", "generator", "icon", "id", "object", "published", "provider", "target",
                          "title", "updated", "url", "verb", "openSocial", "extensions"],
       "group" : [ "id", "title", "description"],
       "album" : ["id", "thumbnailUrl", "title", "description", "location", "ownerId"],
       "mediaItem" : ["album_id", "created", "description", "duration", "file_size", "id", "language", "last_updated",
                      "location", "mime_type", "num_comments", "num_views", "num_votes", "rating", "start_time",
                      "tagged_people", "tags", "thumbnail_url", "title", "type", "url"]
    }
  },
  "osapi.services" : {
    // Specifying a binding to "container.listMethods" instructs osapi to dynamicaly introspect the services
    // provided by the container and delay the gadget onLoad handler until that introspection is
    // complete.
    // Alternatively a container can directly configure services here rather than having them
    // introspected. Simply list out the available servies and omit "container.listMethods" to
    // avoid the initialization delay caused by gadgets.rpc
    // E.g. "gadgets.rpc" : ["activities.requestCreate", "messages.requestSend", "requestShareApp", "requestPermission"]
    // [JAF] Disable container side OSAPI services to avoid warning about missing RPC service.
    //"gadgets.rpc" : ["container.listMethods"]
  },
  "osapi" : {
    // The endpoints to query for available JSONRPC/REST services
    "endPoints" : [ "${jiveAppUrlBase}/social/rpc" ]
  },
  "osml": {
    // OSML library resource.  Can be set to null or the empty string to disable OSML
    // for a container.
//    "library" : ""
    "library": "config/OSML_library.xml"
  },
  "shindig-container": {
    "serverBase": "/gadgets/"
  },
  "container" : {
    "relayPath": "/gadgets/files/container/rpc_relay.html"
  },
    // if using a Jive system property in an EL replace dots with underscore.
  "jive-opensocial-ext-v1": {
    "marketId": "${jive_appsmarket_id}",
    "version": "${jive_appcontainer_version}",
    "jiveUrl": "${jiveContainerUrl}"
  }
}}
