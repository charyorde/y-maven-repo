/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals innerShiv kjs */

/**
 * Base class for view classes.
 *
 * @class
 * @extends jive.conc.observable
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/util.js
 * @depends template=jive.shared.soy.loading
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 */
jive.AbstractView = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        if (options && options.selector) {
            this.selector = options.selector;
        }
    };

    /**
     * returns jQuery reference to dom element or to content rendered by the view
     */
    this.getContent = function(){
        return this.content || $(this.selector);
    };

    // Subclasses must imlement a getSoyTemplateMethod.  Returns reference to soy template function
    protect.getSoyTemplate = "abstract";

    /**
     * renders view using template, placed rendered template in element returned from getContent
     * 
     * @param data JSON data to render
     */
    this.render = function(data){
        this.getContent().html(this.getSoyTemplate(data));
        this.postRender();
    };

    // Subclasses must implement a postRender method.  Called after render method or on page ready event after server
    // side soy rendering 
    this.postRender = function(){

    };

    this.find = function(selector){
        return this.getContent().find(selector);
    }

    /**
     * Replaces the content of the root element of this view with the given
     * content.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|jive.AbstractView} content to display
     */
    this.html = function(content) {
        this.getContent().html(content);
    };

    /**
     * Appends content represented by this view to the given parent.
     * The given parent must have an `append()` method that accepts
     * DOM instances.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|jive.AbstractView} parent element that content will be appended to
     */
    this.appendTo = function(parent) {
        $(parent).append(this.getContent());
    };

    /**
     * Accepts content to append to this view's content.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|DOMElement|String} child content to append
     */
    this.append = function(child) {
        this.getContent().append(child);
    };

    /**
     * Appends content represented by this view to the given parent.
     * The given parent must have a `prepend()` method that accepts
     * DOM instances.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|jive.AbstractView} parent element that content will be prepended to
     */
    this.prependTo = function(parent) {
        $(parent).prepend(this.getContent());
    };

    /**
     * Accepts content to prepend to this view's content.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|DOMElement|String} child content to prepend
     */
    this.prepend = function(child) {
        this.getContent().prepend(child);
    };

    /**
     * Assuming this view's content is in the DOM, replaces that content with
     * the given content or view object.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery|DOMElement|String|jive.AbstractView} child content to prepend
     */
    this.replaceWith = function(replacement) {
        var newContent = replacement.getContent ? replacement.getContent() : replacement;
        this.getContent().replaceWith(newContent);
    };

    /**
     * Adds the given class names to the top-level element of this view.
     *
     * @methodOf jive.AbstractView#
     * @param {string} classNames space-separated classes to add
     */
    this.addClass = function(/* classNames */) {
        var content = this.getContent();
        content.addClass.apply(content, arguments);
    };

    /**
     * Removes the given class names from the top-level element of this view.
     *
     * @methodOf jive.AbstractView#
     * @param {string} classNames space-separated classes to remove
     */
    this.removeClass = function(/* klass */) {
        var content = this.getContent();
        content.removeClass.apply(content, arguments);
    };

    /**
     * Makes content visible if it was previously hidden.
     *
     * @methodOf jive.AbstractView#
     */
    this.show = function() {
        this.getContent().show();
        return this;
    };

    /**
     * Hides content.
     *
     * @methodOf jive.AbstractView#
     */
    this.hide = function() {
        this.getContent().hide();
        return this;
    };

    /**
     * Removes content from the DOM without disturbing event handlers or
     * data attributes.
     *
     * @methodOf jive.AbstractView#
     */
    this.detach = function() {
        this.getContent().detach();
        return this;
    };

    /**
     * Removes content from the DOM and cleans up event handlers.
     *
     * @methodOf jive.AbstractView#
     */
    this.remove = function() {
        this.getContent().remove();
        return this;
    };

    /**
     * Displays a loading spinner.  Any arguments given will be passed directly
     * to createSpinner().
     *
     * Do not override this method!  Override createSpinner() instead.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery} [scope] if omitted only one loading indicator will be
     * displayed at any time per view instance; if a scope element is given
     * then one indicator per scope element will be displayed
     */
    this.showSpinner = function(scope) {
        var args = arguments
          , view = this;

        if (!this.getSpinnerTimeout(scope)) {
            this.setSpinnerTimeout(scope, setTimeout(function() {
                view.createSpinner.apply(view, args);
            }, 100));
        }
    };

    /**
     * Hides the loading spinner if it is displayed.  Any arguments given will
     * be passed directly to destroySpinner().
     *
     * Do not override this method!  Override destroySpinner() instead.
     *
     * @methodOf jive.AbstractView#
     * @param {jQuery} [scope] if omitted only one loading indicator will be
     * displayed at any time per view instance; if a scope element is given
     * then one indicator per scope element will be displayed
     */
    this.hideSpinner = function(scope) {
        var timeout = this.getSpinnerTimeout(scope);

        if (timeout) {
            clearTimeout(timeout);
            this.removeSpinnerTimeout(scope);
        }

        this.destroySpinner.apply(this, arguments);
    };

    /**
     * Renders a loading spinner.  Override this method to customize the
     * appearance of the loading spinner in subclasses.
     */
    protect.createSpinner = function(options) {
        var content = this.getContent();

        // call loader_view class init
        this.spinner = new jive.loader.LoaderView(options);

        if (options && options.context) {
            this.spinner.appendTo(options.context);
        } else if (content) {
            this.spinner.appendTo(content.filter(':last'));
        } else {
            this.spinner.appendTo('body');
        }
    };

    /**
     * Removes or hides the loading spinner.  Override this method to customize
     * the appearance of the loading spinner in subclasses.
     */
    protect.destroySpinner = function() {
        var spinner = this.spinner;

        if (spinner) {
            spinner.getContent().fadeOut(200, function() {
                spinner.getContent().remove();
                spinner.destroy();
            });
        }

        delete this.spinner;
    };

    protect.getSpinnerTimeout = function(scope) {
        if (scope && scope.data) {
            return scope.data('loadingSpinnerTimeout');
        } else {
            return this.loadingSpinnerTimeout;
        }
    };

    protect.setSpinnerTimeout = function(scope, timeout) {
        if (scope && scope.data) {
            scope.data('loadingSpinnerTimeout', timeout);
        } else {
            this.loadingSpinnerTimeout = timeout;
        }
    };

    protect.removeSpinnerTimeout = function(scope) {
        if (scope && scope.data) {
            scope.removeData('loadingSpinnerTimeout');
        } else {
            delete this.loadingSpinnerTimeout;
        }
    };

    /**
     * In IE prepares HTML5 content so that it will render correctly.  In other
     * browsers returns its argument unaltered.
     */
    protect.shiv = function(html) {
        if (typeof innerShiv != 'undefined') {
            return innerShiv(html);
        } else {
            return html;
        }
    };

    /**
     * Given a string representing HTML parses script tags and removes them.
     * Returns a two-element array where the first element is the input html
     * with script tags removed and the second element is a function that will
     * execute the parsed script tags when invoked.
     */
    protect.separateScripts = jive.util.separateScripts;
});

define('jive.AbstractView', function() {
    return jive.AbstractView;
});
