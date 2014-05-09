/**
 * Prevents soydata.js from throwing an error due to the presence of
 * undefined goog.provide() calls.
 */
var goog = goog || {};
goog.provide = goog.provide || function() {
    return jive.namespace.apply(window, arguments);
};
