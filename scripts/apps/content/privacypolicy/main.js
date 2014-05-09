jive.namespace('privacypolicy');

/**
 * @depends path=/resources/scripts/apps/content/privacypolicy/source.js
 * @depends path=/resources/scripts/apps/content/privacypolicy/view.js
 */ 
jive.privacypolicy.Main = jive.oo.Class.extend(function(protect) {  

  this.init = function(options) {
    var main = this;
    main.options = options || {};
    main.documentID = options.documentID;

    this.Source = options.Source || new jive.privacypolicy.Source(options);
    this.Source.suppressGenericErrorMessages();

    this.View = new jive.privacypolicy.View(options);

    /*
     * onload event listener to retrieve content
     */
    this.View.addListener('loaded', function(promise) {
      // see scripts/jive/util.js
      // jive.util.escapeHTML
      main.View.showSpinner();
      main.Source.get(main.documentID).addCallback(
        function(content) {
          main.View.render(content);
        }
        ).always(function() {
          main.View.hideSpinner();
      });
    });
  };
});
