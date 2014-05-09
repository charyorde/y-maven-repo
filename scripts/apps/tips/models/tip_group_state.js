/*jslint laxbreak: true */

jive.namespace('Tips');  // Creates the namespace if it does not already exist.

/**
 * Represents a user's state in a tip group.
 */
jive.Tips.TipGroupState = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        this.stateKey = options.stateKey;
        this.currentTipId = options.currentTipID || null;
        this.dismissed = options.dismissed || false;
        this.skipped = false;
    };

    this.setCurrentTipId = function(id){
        this.currentTipId = id;
    };

    this.getCurrentTipId = function(){
        return this.currentTipId;
    };

    this.setDismissed = function(dismissed) {
        this.dismissed = dismissed;
    };

    this.isDismissed = function(){
        return this.dismissed;
    };

    this.setSkipped = function(skipped) {
        this.skipped = skipped;
    };

    this.isSkipped = function(){
        return this.skipped;
    };

    this.getKey = function(){
        return this.stateKey;
    };

    this.serialize = function() {
        var value = this.isDismissed() ? "true" : "false";
        if (this.currentTipId) {
            value += "#" + this.currentTipId;
        }
        return value;
    };

});
