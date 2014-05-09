jive.namespace('terms');

/**
 * @depends path=/resources/scripts/apps/content/terms/source.js
 * @depends path=/resources/scripts/apps/content/terms/view.js
 */ 
jive.terms.Main = jive.oo.Class.extend(function(protect) {  

  this.init = function(options) {
    var main = this;
    main.options = options || {};
    main.documentID = options.documentID;

    this.Source = options.Source || new jive.terms.Source(options);
    this.Source.suppressGenericErrorMessages();

    this.View = new jive.terms.View(options);

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
