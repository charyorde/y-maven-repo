jive.namespace('invite');

/**
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */

jive.invite.InviteSource = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = "invite";

    this.init = function(options) {
        _super.init.call(this, options);
        this.suppressGenericErrorMessages();
        this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v2/" + this.pluralizedResourceType + (options.trackingID ? '?sr=' + options.trackingID + '&gRef=' + options.gids + '&spRef=' + options.spids : '');
        this.POST_RESOURCE_ENDPOINT = this.RESOURCE_ENDPOINT;
    };

    this.showGenericSaveError = function(){
        this.displayError(this.errorSaving());
    };

    this.saveUrl = function(resource) {
        var url = _super.saveUrl.call(this, resource);
        var fromQuest = $j.deparam.querystring().fromQ;
        if (fromQuest) {
            var queryParams = "?fromQuest=" + fromQuest;
            return url + queryParams;
        } else {
            return url;
        }
    };
});
