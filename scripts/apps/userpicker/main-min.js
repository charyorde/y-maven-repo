jive.namespace("UserPicker");jive.UserPicker.Main=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(b){var c=this;var d={startingUsers:{users:[],userlists:[]},multiple:false,emailAllowed:false,userAllowed:true,listAllowed:false,browseAllowed:true,resultListAllowed:true,disabled:false,valueIsUsername:false,document:$j(document),canInvitePartners:false,canInviteJustPartners:false,canInvitePreprovisioned:false,invitePreprovisionedDomainRestricted:false,object:null,entitlement:"VIEW",name:"",$input:null,existingModal:{modalContainer:"",prevContainer:"",browseContainer:""},filterIDs:[],maxSelectedCount:100};c.options=$j.extend(d,b);if(!c.options.view){c.options.view=new jive.UserPicker.View(c.options.$input,c.options)}if(!c.options.model){c.options.model=new jive.UserPicker.Source($j.extend(c.options,{resultLimit:c.options.maxSelectedCount}))}this.options.view.addListener("autocompleteRequest",function(e){c.options.model.autocomplete(e).addCallback(function(f){if(typeof(f)=="object"){c.options.view.autocompleteResponse(f)}})});this.options.view.addListener("batchRequest",function(e,f){c.options.model.autocomplete(e).addCallback(function(g){if(typeof(g)=="object"){f.emitSuccess(g)}else{f.emitSuccess({})}}).addErrback(function(g){f.emitError(g)})});this.options.view.addListener("loadUser",function(e,f){c.options.model.load(e).addCallback(function(g){f.emitSuccess(g)}).addErrback(function(g){f.emitError(g)})});this.options.view.addListener("selectedUsersChanged",function(e){c.emit("selectedUsersChanged",e)})};this.setDisabled=function(c){this.options.view.setDisabled(c)};this.setCanInvitePartners=function(c){this.options.view.setCanInvitePartners(c)};this.setUsers=function(b){this.options.view.setSelectedUsers(b)};this.setLists=function(b){this.options.view.setSelectedLists(b)};this.hide=function(){this.options.view.hide()};this.show=function(){this.options.view.show()};this.val=function(){return this.options.view.val()};this.getSelectedUsersAndLists=function(c){var b=this.options.view.getSelectedUsersAndLists(c);b.changes={};return b};this.setNoPicker=function(c){this.options.view.setNoPicker(c)};this.reset=function(){this.options.view.setSelectedUsers(this.options.startingUsers.users);this.options.view.setSelectedLists(this.options.startingUsers.userlists)}});