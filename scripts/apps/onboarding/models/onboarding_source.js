/*globals Blob File */

jive.namespace('Onboarding');

/**
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/apps/browse/container/model/container_source.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 */
jive.Onboarding.Source = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = "container";

    protect.init = function(options) {
        options = options || {};
        _super.init.call(this, options);

        this.RESOURCE_ENDPOINT = jive.rest.url("/onboarding");

        this.placeSource = new jive.Browse.Container.ItemSource();
    };

    this.initializeView = function(promise) {
        var url = this.RESOURCE_ENDPOINT;
        if (!promise) {
            promise = new jive.conc.Promise();
        }
        return this.commonAjaxRequest(promise, 'GET', { url: url});
    };

    this.getStepData = function(questID, questStep, promise) {
        var url = this.RESOURCE_ENDPOINT + '/' + questID + '/' + questStep;

        return this.commonAjaxRequest(promise, 'GET', { url: url });
    };

    this.markStepComplete = function(questID, questStep) {
        var url = this.RESOURCE_ENDPOINT + '/' + questID + '/' + questStep + '/complete',
            promise = new jive.conc.Promise();
        promise.addCallback(function(viewData) {
            jive.switchboard.emit('onboarding.state.update', viewData);
        });
        return this.commonAjaxRequest(promise, 'POST', { url: url });
    };

    this.setOnboardingVisible = function(visible, promise) {
        var url = this.RESOURCE_ENDPOINT + '/' + visible.toString();
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url });
    };

    this.newUserExploreOnOwn = function() {
        var url = this.RESOURCE_ENDPOINT + '/exploreOnOwn';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url });
    };

    this.updateUserProfile = function(interestsVal, bioVal, promise) {
        var source = this,
            suggestedPlacesExist = false,
            trimmedInterests = $j.trim(interestsVal),
            trimmedBio = $j.trim(bioVal),
            queryTerm = "";
        if (interestsVal) {
            interestsVal = interestsVal.replace(/[\'\"\?\@\*\n\.,-\/\\#!$%\^&\;:\+{}\[\]\|=\-_`~()<>]/g," ");
            interestsVal = $j.trim(interestsVal);
            interestsVal = interestsVal.replace(/\s{2,}/g," ");
            if (interestsVal) {
                interestsVal = interestsVal + "*";
            }
        }
        if (bioVal) {
            bioVal = bioVal.replace(/[\'\"\?\@\*\n\.,-\/\\#!$%\^&\;:\+{}\[\]\|=\-_`~()<>]/g," ");
            bioVal = $j.trim(bioVal);
            bioVal = bioVal.replace(/\s{2,}/g," ");
            if (bioVal) {
                bioVal = bioVal + "*";
            }
        }
        if (interestsVal && bioVal) {
            queryTerm = interestsVal + " " + bioVal;
        }
        else if (interestsVal) {
            queryTerm = interestsVal;
        }
        else {
            queryTerm = bioVal;
        }
        if (queryTerm) {
            var queryTerms = queryTerm.split(" ");
            queryTerm = queryTerms.join(" OR ");
            var searchParams = {
                type: ['group','space'],
                limit: 20
            };
            searchParams.q = queryTerm;
            var url = jive.app.url({ path: '/api/core/v2'} );
            url += "/search/places";
            url = $j.param.querystring(url, searchParams);
            source.commonAjaxRequest(new jive.conc.Promise(), 'GET', { url: url }).addCallback(function(placeData) {
                var placeEntities = [];
                if (placeData && placeData.data && placeData.data.length) {
                    suggestedPlacesExist = true;
                    placeEntities = $j.map(placeData.data, function(place) {
                        return {
                            readableType: place.type,
                            id: place.id
                        };
                    });
                }
                var url = source.RESOURCE_ENDPOINT + '/profile';
                source.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: JSON.stringify({
                    profileData: {
                        interests: trimmedInterests,
                        bio: trimmedBio
                    },
                    entities: placeEntities
                })}).addCallback(function(suggestedPlaces) {
                    var data = {
                        suggestedPlaces: suggestedPlaces,
                        suggestedPlacesExist: suggestedPlacesExist
                    };
                    promise.emitSuccess(data);
                });
            });
        }
        else {
            url = source.RESOURCE_ENDPOINT + '/profile';
            source.commonAjaxRequest(promise, 'POST', { url: url, data: JSON.stringify({
                profileData: {
                    interests: trimmedInterests,
                    bio: trimmedBio
                },
                entities: []
            })});
        }
    }
});



define('jive.onboarding.Source', function() {
    return jive.Onboarding.Source;
});
