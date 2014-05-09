/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * The `jQuery#ready()` method is a great way to run a callback asynchronously
 * after the DOM is loaded and all JavaScript has been evaluated.
 * Unfortunately `ready()` comes with a nasty surprise: if it is called after
 * the DOM is ready then it executes the callback synchronously.  This can
 * easily break code that was written with the assumption that `ready()` will
 * always run asynchronously.  See http://dev.jquery.com/ticket/6185
 *
 * This code adds another ready function `jQuery#asyncReady()` so that it runs asynchronously
 * under all conditions. Eventually it will be used to patch #ready
 *
 */

/*jslint browser:true */
/*extern jQuery */

(function() {
   var oldReady = jQuery.fn.ready;
   jQuery.fn.asyncReady = function() {
       var self = this, args = arguments;
       if (jQuery.isReady) {
           setTimeout(function() {
               oldReady.apply(self, args);
           }, 1);
       } else {
           return oldReady.apply(self, args);
       }
   };
})();