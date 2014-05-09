/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Created with IntelliJ IDEA.
 * User: jsmyth
 * Date: 6/8/12
 * Time: 1:35 PM
 * To change this template use File | Settings | File Templates.
 */
(function($) {
    /**
     * This plugin allows for lazy instantiation of View enhancement objects for HTML elements.
     * View enhancement objects add centralized functionality to an html element by wrapping the element in a view object that is returned from this plugin
     * Views created with this plug in remain with the element that is wrapped so that the plug in will only create one instance per bindName
     * and reuse that instance when requested.
     *
     * View constructors need to follow a very simple interface which takes the wrapped element as it's only argument
     *
     * View constructors should also define the getBindName method or else each instance will have to be named at bind time.
     * This method should be on the constructor itself not the constructed view.
     *
     * @param view constructor function of the object
     * @param? bindName String name to bind the view to. If left out it will default to the getBindName method on the view constructor (not the instance);
     * @return Instance of view bound to the first element in the jQuery object, or undefined if the jQuery object is empty
     * @throws IllegalViewParameterException if the view supplied is not a function
     * @throws IllegalBindParameterException if the bindName is null and the view does not return a non null value from getBindName()
     * @throws PropertyAlreadyBoundException if the value already stored on the element as bindName is incompatible with supplied view
     */
    $.fn.view = function(view, bindName){
        if(!jQuery.isFunction(view)){
            throw "IllegalViewParameterException";
        }
        if(!bindName && view.getBindName){
            bindName = view.getBindName();
        }
        if(!bindName){
            throw "IllegalBindParameterException";
        }
        var boundView;
        if(this.length){
            var $first = this.first();
            boundView = $first.data(bindName);
            if(boundView == null){
                //console.debug("Creating View of " + view + " on " + $first + " as " + bindName);//This log is very handy for determining if a view is being recreated when it should be reusing an existing bound view
                boundView = new view($first.get(0));
                $first.data(bindName, boundView);
            } else if(!(boundView instanceof view)) {
                throw "PropertyAlreadyBoundException";
            }
        }
        return boundView;
    };

})(jQuery);