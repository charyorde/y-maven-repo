jive.TabView=function(e,m){jive.conc.observable(this);m=m||{};var j=m.activeClass||"jive-body-tabcurrent",a=m.tabSelector||".jive-body-tab",d=m.nameFromTab||function(n){return n.attr("id").replace(/-tab$/,"")},h=this;function l(){return $j(e).find(a)}function c(){return l().filter(function(){return $j(this).hasClass(j)})}function g(){return d(l().filter(function(){return $j(this).hasClass(j)}))}function f(n){l().each(function(){var p=$j(this),o=d(p);p.toggleClass(j,o==n)});l().each(function(){var q=$j(this),p=d(q),o=$j('[id="'+p+'"]');if(p==n){o.show()}else{o.hide()}})}function k(n){h.emit("tabSwitch",n,c())}function i(n){f(n);k(n)}function b(o,p){var n=l().filter(function(){return d($j(this))==o});n.toggle(!!p)}this.switchTo=i;this.setVisibility=b;this.activeTabName=g;this.activeTab=c;$j(document).ready(function(){$j(e).delegate(a,"click",function(p){var o=$j(this),n=d(o);i(n);p.preventDefault()});if(!l().hasClass(j)){l().first().trigger("click")}})};