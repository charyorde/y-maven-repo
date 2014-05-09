/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("rte");

/**
 * Replaces any existing form submit handlers.  Prevents submit while it's formEnabled property is false.
 *
 * @class
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.rte.FormService = jive.oo.Class.extend(function(protect) {
    protect.init = function(options) {
        this.$form = options.$form;
        if(!this.$form || this.$form.length != 1 || this.$form.get(0).nodeName.toLowerCase() != "form"){
            throw new Error("options.$form is required and must select a single form element");
        }

        this._formSubmitHandler = null;

        var that = this;
        function submitHandler(evt){
            var isValid = true;
            if(that.$form.data('validator')){
                var inputs = that.$form.find(":input").not(":button, :image, :reset, :submit"); //find inputs at submit time to pick up dynamic ones.
                isValid = that.$form.data('validator').checkValidity(inputs, evt);
            }

            if(that.isFormEnabled()){
                if(that._formSubmitHandler){
                    return isValid && that._formSubmitHandler(evt);
                }else{
                    return isValid;
                }
            }
            //Display the last valid message
            var message;
            for(var i = that.formDisabledTokens.length-1; i >= 0; --i){
                if(typeof that.formDisabledTokens[i] == "string"){
                    message = that.formDisabledTokens[i];
                    break;
                }
            }
            if(message){
                $j(renderMessage(message)).message({style: "info"});
            }
            return false;
        }

        var form = this.$form.get(0);
        if(form.onsubmit){
            this.setFormSubmitHandler(form.onsubmit);
            form.onsubmit = null;
        }
        if(options.formSubmitHandler){
            this.setFormSubmitHandler(options.formSubmitHandler);
        }

        this.$form.unbind("submit").bind("submit", submitHandler);

        //If any token exists and is truthy, the form is disabled.  If the token's a string, it's the message to display.
        this.formDisabledTokens = [];
    };

    function renderMessage(str){
        return $j("<div/>").text(str).get(0);
    }

    this.setFormSubmitHandler = function(handler, context){
        if(!context){
            context = this.$form.get(0);
        }
        handler = $j.proxy(handler, context);
        this._formSubmitHandler = handler;
    };

    this.isFormEnabled = function(){
        //Iterate backward because later tokens are more recent, and so more likely to be true.
        for(var i = this.formDisabledTokens.length-1; i >= 0; --i){
            if(this.formDisabledTokens[i]){
                return false;
            }
        }
        return true;
    };

    /**
     * Set the form enabled status.  While disabled, the form won't submit.
     * @param {number|boolean} formEnabled Form token to enable, or false to disable.
     * @param {string=} message optional message to be displayed if the form is submitted while disabled.  Ignored when enabling.
     */
    this.setFormEnabled = function(formEnabled, message){
        if(!message){
            message = true;
        }

        if(!formEnabled){
            this.formDisabledTokens.push(message);
            return this.formDisabledTokens.length;
        }else{
            this.formDisabledTokens[formEnabled-1] = false;
        }
    };
});

define('jive.rte.FormService', function() {
    return jive.rte.FormService;
});
