/**
 * a paramter set for macros
 */
jive.rte.ParamSet = function(){

    var that = this;
    this.name = "";
    this.deleteAll = false;
    this.params = new Array();

    this.addParam = function(n, v){
        that.params.push({ name: n, value : v})
    }
    
}