var ManageAppServicePermsModalClass=jive.oo.Class.extend(function(){this.init=function(a,b,d){this.containerID=a;this.viewManageGroupsURL=b;this.viewManageUsersURL=d;this.groups=[{ID:2000,name:"group1"},{ID:2001,name:"group2"}];this.userExceptions=[{ID:1000,name:"user1"},{ID:1001,name:"user2"}];var c=this;$j("div[id^=edit-serice-perm-]").each(function(){$j(this).click(function(g){var f=$j(this).children("a").attr("id");c.show();g.preventDefault()})})};this.show=function(){var a=this;var b=jive.soy.admin.appservice.perms.showManageModal({groups:this.groups,userExceptions:this.userExceptions,viewManageGroupsURL:this.viewManageGroupsURL,viewManageUsersURL:this.viewManageUsersURL});$j("#"+this.containerID).html(b);$j("#newmembers").userAutocomplete({multiple:true,userParam:"newadmins",minInputLength:2,urls:{userAutocomplete:"/user-autocomplete.jspa",browseModal:"/user-autocomplete-modal.jspa"}});$j("#"+this.containerID).lightbox_me({closeSelector:".jive-modal-close, .close"})}});