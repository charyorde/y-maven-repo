/**
 * @fileoverview Loads generic modules required for all widgets.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Zapatec, Inc.
 * http://www.zapatec.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/* $Id: zapatec.js 6396 2007-02-20 21:34:13Z alex $ */

if (typeof Zapatec == 'undefined') {
  /**
   * @ignore Namespace definition.
   */
  Zapatec = function() {};
}

/**
 * @ignore Zapatec Suite version.
 */
Zapatec.version = '07-01';

if (typeof Zapatec.zapatecPath == 'undefined') {
  /**
   * @ignore Path to main Zapatec script.
   */
  Zapatec.zapatecPath = function() {
    if (document.documentElement) {
      // Value from innerHTML doesn't contain redundant spaces and is always
      // inside double quotes
      var aTokens = document.documentElement.innerHTML.match(
       /<script[^>]+src="([^"]*zapatec(-src)?\.js[^"]*)"/i);
      if (aTokens && aTokens.length >= 2) {
        // Get path
        aTokens = aTokens[1].split('?');
        aTokens = aTokens[0].split('/');
        // Remove last token
        if (Array.prototype.pop) {
          aTokens.pop();
        } else {
          // IE 5
          aTokens.length -= 1;
        }
        return aTokens.length ? aTokens.join('/') + '/' : '';
      }
    }
    // Not found
    return '';
  } ();
}

/**
 * @ignore Simply writes script tag to the document.
 *
 * <pre>
 * If special Zapatec.doNotInclude flag is set, this function does nothing.
 * </pre>
 *
 * @param {string} sSrc Src attribute value of the script element
 * @param {string} sId Optional. Id of the script element
 */
Zapatec.include = function(sSrc, sId) {
  // Check flag
  if (Zapatec.doNotInclude) {
    return;
  }
  // Include file
  document.write('<script type="text/javascript" src="' + 
   sSrc + (typeof sId == 'string' ? '" id="' + sId : '') + '"></script>');
};

// Include required scripts
Zapatec.include(Zapatec.zapatecPath + 'utils.js', 'Zapatec.Utils');
Zapatec.include(Zapatec.zapatecPath + 'zpeventdriven.js', 'Zapatec.EventDriven');
Zapatec.include(Zapatec.zapatecPath + 'transport.js', 'Zapatec.Transport');
Zapatec.include(Zapatec.zapatecPath + 'zpwidget.js', 'Zapatec.Widget');
