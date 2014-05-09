/**
 * Groups controller
 * @depends template=jive.invite.emailcontacts.inviterGroups
 *
 * @depends path=/resources/scripts/libs/underscore.js
 * @depends path=/resources/scripts/apps/places/models/places_source.js
 */
jive.namespace('Places').GroupsController = {

  initialize: function(options) {
    var $container = $j(options.container),
    selector = options.selector,
    soyTemplate = options.soyTemplate,
    placeType = options.placeType,
    userId = options.user, 
    model = new jive.Places.PlacesSource(),
    //getPlacesType = model.getPlacesType.bind(model, placeType);
    //getUserGroups = model.getUserGroups.bind(model, placeType +"s");
    getUserGroups = model.getUserGroups.bind(model);

    /**
     * Query Places
     */
    function requestData() {
      //getPlacesType().addCallback(displayData);
      getUserGroups().addCallback(displayData);
    }

    /**
     * Parse and renders data for easy
     * templating
     *
     */ 
    function displayData(data) {
      var params = { data: data["list"], inviter: userId, isMember: true }; 
      
      // @todo Find a way to dynamically pass the soy function
      //$container.find(selector).html(soyTemplate(params));
      $j('#inviter-places-reco').find(".igroups").each(function() {
        $j(this).html(soyTemplate(params));
      } );
    }

    /**
     * @deprecated
     *
     * @see displayData
     */ 
    function parseAndDisplayData(data) {
      var $memberRef = [];
      members = undefined || [];
      var dataItems = [];
      
      // @todo Parse data to retrieve all members of spaces
      // At the moment there's no documented way to retrieve users following
      // a space or page.
      // see https://community.jivesoftware.com/casethread/280682
      _.find(data["list"], function(items) {
        $memberRef.push(items.creator.resources.members.ref);
      });

      $memberRefPaths = $j.unique($memberRef);

      $j($memberRefPaths).each(function(index, val) {
        members.push(Number(val.substr(-1,1)));
      });

      isMember = $j.inArray(userId, members) ? true : false;

      var params = { data: data["list"], inviter: userId, isMember: isMember }; 

      // @todo Find a way to dynamically pass the soy function
      //$container.find(selector).html(soyTemplate(params));
      $j('#inviter-places-reco').find('.igroups').each(function() {
        $j(this).html(soyTemplate(params));
      } );
    }

    requestData();

   }

};
