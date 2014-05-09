jive.namespace('DirectMessaging');

jive.DirectMessaging.MessageSource = jive.RestService.extend(function(protect, _super) {
    jive.conc.observable(this);

    protect.resourceType = "wall";
    protect.pluralizedResourceType = protect.resourceType;

    this.init = function(userSource, options) {
        this.urlParams = '/14/1';
        if (options && options.trackingID) {
            this.urlParams += '?sr=' + options.trackingID;
        }
        this.userSource = userSource;
        _super.init.call(this, options);
    };

    /*
     * Reusing the jive.Browse.User.ItemSource functionality here. This could be greatly simplified and improved by
     * making a call that gets a list of users for a given list of id's or user names.  Until then this will have to do.
     */
    this.getUsersByIds = function() {
        var self = this,
            promise = new jive.conc.Promise(),
            userIds = Array.prototype.slice.call(arguments),
            users = [];

        function getNextUserById() {
            if (userIds.length > 0) {
                self.userSource.get(userIds.shift()).addCallback(function(user) {
                    users.push(user);
                    getNextUserById();
                });
            } else {
                promise.emitSuccess(users);
            }
        }
        getNextUserById();

        return promise;
    };

    this.sendMessage = function(wallentry) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            data: JSON.stringify({
                wallentry: $j.extend({}, wallentry, {
                    privateDM: true
                })
            }),
            type: "POST",
            url: this.RESOURCE_ENDPOINT + this.urlParams,

            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data, textStatus, xhr) {
                promise.emitSuccess(data);
            },
            error: function(data, textStatus, xhr) {
                try {
                    var jsonResp  = $j.parseJSON(data.responseText);

                    if (jsonResp && jsonResp.error && jsonResp.error.message) {
                        promise.emitError(jsonResp.error.message, jsonResp.error.code);
                    }
                }
                catch(_) {
                    promise.emitError(null, data && data.status);
                }
            }
        });

        return promise;
    };
});
