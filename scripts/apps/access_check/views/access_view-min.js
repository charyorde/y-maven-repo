jive.namespace("AccessCheckApp");jive.AccessCheckApp.AccessCheckView=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(c){var b=this;this.i18n=c.i18n;this.options=c;this.userAutocompleteID="#jive-access-autocomplete";this.accessResultsID="#jive-access-results";this.submitAccessCheck=function(d){if(d.users.length==0){$j(b.accessResultsID).html("")}else{var e=new jive.loader.LoaderView({size:"small",showLabel:false});e.appendTo(b.accessResultsID);b.emitP("checkAccess",b.options.objectType,b.options.objectID,d.users[0].id).addCallback(function(f){if(f===true){$j(b.accessResultsID).html("<p>"+b.i18n.hasAccess+'</p><p class="font-color-meta-light">'+b.i18n.warning+"</p")}else{$j(b.accessResultsID).html("<p>"+b.i18n.noAccess+'</p><p class="font-color-meta-light">'+b.i18n.warning+"</p>")}e.destroy();e=null}).addErrback(function(){$j(b.accessResultsID).html(b.i18n.error);e.destroy();e=null})}};$j(document).ready(function(){var d=new jive.UserPicker.Main({$input:$j(b.userAutocompleteID)});d.addListener("selectedUsersChanged",b.submitAccessCheck)})}});