jive.namespace("UserPrefs.Mobile");jive.UserPrefs.Mobile.PairingList=jive.AbstractView.extend(function(a){a.init=function(c){var b=this;this.content=$j(c);this.content.delegate(".js-remove-pairing","click",function(d){b.emit("remove",b.getOAuthPairingID(this))});this.content.delegate(".js-activation-code","click",function(d){b.emit("show-activation-popup",b.getOAuthPairingID(this));d.preventDefault()});this.content.delegate(".js-mobile-renew","click",function(d){b.emit("renew",b.getOAuthPairingID(this));d.preventDefault()})};a.getOAuthPairingID=function(b){return $j(b).parents("[data-OAuthPairingID]").attr("data-OAuthPairingID")};this.removeRow=function(b){this.hideSpinner();this.content.find("tr[data-OAuthPairingID="+b+"]").remove();if(this.content.find("tbody > tr").length==0){this.content.parent().hide()}};this.addNew=function(b){$j(jive.preferences.mobile.newDeviceRow({pairing:b})).prependTo(this.content.find("tbody"));this.content.parent().show()}});