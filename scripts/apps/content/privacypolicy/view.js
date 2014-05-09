jive.namespace('privacypolicy');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.html.widget.soy.privacypolicy.*
 */ 
jive.privacypolicy.View = jive.AbstractView.extend(function(protect) {

  protect.init = function(options) {
    var view = this;
    view.content = $j('#yookos-privacy-policy');
    view.options = options || {};
    $j(document).ready(function() {
      view.emit('loaded');
    });
  };
  
  protect.getSoyTemplate = jive.html.widget.soy.privacypolicy.content;
    
});
