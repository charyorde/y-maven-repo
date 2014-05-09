jive.namespace('rules');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.html.widget.soy.rules.*
 */ 
jive.rules.View = jive.AbstractView.extend(function(protect) {

  protect.init = function(options) {
    var view = this;
    view.content = $j('#yookos-rules');
    view.options = options || {};
    $j(document).ready(function() {
      view.emit('loaded');
    });
  };
  
  protect.getSoyTemplate = jive.html.widget.soy.rules.content;
    
});
