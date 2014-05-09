/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j $Class */

jive.namespace('shared');

/**
 * @depends template=jive.shared.formwaiting.formWaitingOverlay
 */
jive.shared.FormWaitingView = $Class.extend({
    init: function(container, options) {
        this._$container = $j(container);
        options = options || {};
        if(options.containerPadding){
            this._containerPadding = options.containerPadding;
        } else {
            this._containerPadding = this._$container.css('padding-left') == null ?
                                     0 :
                                     Number(this._$container.css('padding-left').replace('px', ''));
        }
        this._buttonSelector = options.buttonSelector || 'input[type=button], input[type=submit]';
        this._bgCssClass = options.bgCssClass || 'jive-form-waiting-disable-bg';
    },
    disableForm:function(){
        var spinner = new jive.loader.LoaderView({size: 'big'});

        if(this._$container.find('.jive-js-form-disable').length == 0){
            var dimensions = {width:this._$container.innerWidth(),
                height:this._$container.innerHeight(), left:0, top:0};
            var $disableOverlay = $j(jive.shared.formwaiting.formWaitingOverlay({bgCssClass:this._bgCssClass}));
            //set dimensions of overlay
            for(var key in dimensions){
                $disableOverlay.css(key, dimensions[key] + 'px');
            }
            $disableOverlay.prependTo(this._$container);
            // center label
            var $loadLabel = spinner.getContent();
            spinner.appendTo($disableOverlay);
            $loadLabel.css('left', (dimensions.width/2 - $loadLabel.width()/2) + 'px');
            $loadLabel.css('top', (dimensions.height/2 - $loadLabel.height()/2) + 'px');
            this._$container.find(this._buttonSelector).prop('disabled', true);
        }
    },
    enableForm:function(){
        this._$container.find('.jive-js-form-disable').remove();
        this._$container.find(this._buttonSelector).prop('disabled', false);
    }
});
