

var ManageAppServicePermsModalClass = jive.oo.Class.extend(function(){

    this.init = function(containerID, viewManageGroupsURL, viewManageUsersURL) {
        this.containerID = containerID;
        this.viewManageGroupsURL = viewManageGroupsURL;
        this.viewManageUsersURL = viewManageUsersURL;
        this.groups = [{ID:2000,name:"group1"},{ID:2001,name:"group2"}];
        this.userExceptions = [{ID:1000,name:"user1"},{ID:1001,name:"user2"}];

        //this.PageUtils = new PageUtilsClass();
        //this.HtmlUtils = new HtmlUtilsClass();
        var that = this;
        $j('div[id^=edit-serice-perm-]').each(function() {
             $j(this).click(function(e) {
                var serviceID = $j(this).children('a').attr('id');
                //alert(serviceID)
                that.show();
                e.preventDefault();
             });
        });

    };

    this.show = function(){
        var that = this;
        var modalDialogHTML = jive.soy.admin.appservice.perms.showManageModal( {
                                                        groups:this.groups,
                                                        userExceptions:this.userExceptions,
                                                        viewManageGroupsURL:this.viewManageGroupsURL,
                                                        viewManageUsersURL: this.viewManageUsersURL
                                                    });

        $j('#' + this.containerID).html(modalDialogHTML);

        $j("#newmembers").userAutocomplete({
            multiple: true,
            userParam: 'newadmins',
            minInputLength: 2,
            urls: {
                userAutocomplete: "/user-autocomplete.jspa",
                browseModal: "/user-autocomplete-modal.jspa"
            }
        });


        $j('#' + this.containerID).lightbox_me({closeSelector: ".jive-modal-close, .close"});

    };
});