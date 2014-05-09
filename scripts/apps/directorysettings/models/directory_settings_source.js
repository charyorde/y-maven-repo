jive.namespace('DirectorySettings');
/**
 * Interface to user REST service.
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/lib/core_ext/array.js
 * @extends jive.RestService
 */
jive.DirectorySettings.Source = jive.RestService.extend(function (protect) {

    /**
     * Set to "discussion"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.DiscussionApp.DiscussionRestSource#
     * @type string
     * @protected
     */
    protect.resourceType = "directory";

    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.DiscussionApp.DiscussionRestSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;


    /**
     * Get a form with defaults based on server type.
     * @param params
     * @return {*}
     */
    this.getServerConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/server";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params});
    };

    /**
     * Save changes to the server form.
     * @param params
     * @return {*}
     */
    this.saveServerConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/server";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify(params)});
    };

    /**
     * Get a form with user defaults.
     * @param params
     * @return {*}
     */
    this.getUserConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/user";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params});
    };

    /**
     * Save changes to the user form.
     * @param params
     * @return {*}
     */
    this.saveUserConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/user";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify(params)});
    };

    /**
     * Get a form with group defaults.
     * @param params
     * @return {*}
     */
    this.getGroupConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/group";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params});
    };

    /**
     * Save changes to the group form.
     * @param params
     * @return {*}
     */
    this.saveGroupConfig = function (params) {
        var url = this.RESOURCE_ENDPOINT + "/group";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify(params)});
    };

    /**
     * Reset all configs
     * @param params
     * @return {*}
     */
    this.resetConfigs = function () {
        var url = this.RESOURCE_ENDPOINT + "/";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {url:url});
    };


    this.showGenericSaveError = function(){
        this.displayError(this.errorSaving());
    };

    this.errorCallback = function(promise, genericError) {
        var source = this;

        return function(xhr, textStatus, err) {
            var jsonResp, message, code;

            try {
                jsonResp = JSON.parse(xhr.responseText);
            }
            catch(e) {
                if (e instanceof SyntaxError) {
                    // do nothing
                }
                else {
                    throw e;
                }
            }

            message = jsonResp ? jsonResp.message : null;
            code = (jsonResp && jsonResp.code) ? jsonResp.code : xhr.status;

            // Ajax requests that are in progress when the page is
            // unloaded will be aborted with an error.  We want to
            // ignore those errors.
            if (!source.unloaded) {
                source.maybeEmitError(promise, genericError, [message, code, jsonResp]);
            }
        };
    };

});