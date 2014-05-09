/**
 * @fileoverview Defines Zapatec namespace.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Zapatec, Inc.
 * http://www.zapatec.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/* $Id: zapatec-core.js 6396 2007-02-20 21:34:13Z alex $ */

if (typeof Zapatec == 'undefined') {
  /**
   * Namespace definition.
   * @constructor
   */
  Zapatec = function() {};
}

/**
 * Zapatec Suite version.
 * @private
 */
Zapatec.version = '07-01';

if (typeof Zapatec.zapatecPath == 'undefined') {
  /**
   * Path to main Zapatec script.
   * @private
   */
  Zapatec.zapatecPath = function() {
    if (document.documentElement) {
      // Value from innerHTML doesn't contain redundant spaces and is always
      // inside double quotes
      var aTokens = document.documentElement.innerHTML.match(
       /<script[^>]+src="([^"]*zapatec(-core|-src)?.js[^"]*)"/i);
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
