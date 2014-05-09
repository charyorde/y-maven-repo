/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('invite');

/**
 * @depends template=jive.invite.create
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/invitation/views/invitee_view.js
 */
jive.invite.InviteView =  jive.AbstractView.extend(function(protect) {
        //constructor (init) - sets internal properties binds to source trigger (binding should probably be moved out of the view and just allow the app to listen for events)
        //public Methods
        //open - opens a modal window containing this view
        //close - closes the modal window, clears any temporary values (should only clear values if process is complete, so there is no loss of values if accidentally closed)
        //reportError - notifies the view that an error occured while processing
        //reportSuccess - notifes the view that a request was processed succesfully
        //reset - resets the view to it's default settings
        //clearErrors - removes all errors previously reported
        /**
             * @constructor
             * @param container
             * @param company
             * @param domains
             * @param allowEmail
             * @param allowUsers
             * @param canInvitePartners
             * @param canInviteJustPartners
             * @param canInvitePreprovisioned
             * @param invitePreprovisionedDomainRestricted
             * @param maxInvite
             * @param invitePeriod
             * @param message
             * @param trigger any valid jQuery reference (HTML element, selector, etc). Defaults to '#j-invite-button'
             */
        this.init = function(container, company, domains, allowEmail, allowUsers, canInvitePartners, canInviteJustPartners, canInvitePreprovisioned, invitePreprovisionedDomainRestricted, maxInvite, invitePeriod, message, trial, trigger){
            this.invitees = {};
            this.inviteeLists = {};
            var view = this;
            this.params = {
                message : message,
                container : container,
                inviteEmail : allowEmail,
                inviteUsers : allowUsers,
                canInvitePartners : canInvitePartners,
                canInviteJustPartners : canInviteJustPartners,
                canInvitePreprovisioned :  canInvitePreprovisioned,
                invitePreprovisionedDomainRestricted : invitePreprovisionedDomainRestricted,
                domains : domains,
                companyName : company,
                maxInviteCount : maxInvite,
                invitePeriodHours : invitePeriod,
                trial: trial,
                systemInvite: (container == null || (container.id == 1 && container.type == 'community'))
            };
            this.$trigger = $j(trigger || "#j-invite-button");
            this.$trigger.click(function(click){
                view.open();
                click.preventDefault();
            });
        };

        protect.getSoyTemplate = jive.invite.create;

        /**
              * Opens a Modal Dialog window containing this view. Resets the view as appropriate for the current state.
             * @this {jive.invite.InviteView}
             */
        this.open = function(){
            //TODO this currently reset the form each time it is opened but should be able to carry over some content
            this.initialize();
            this.$template.lightbox_me({destroyOnClose: true, centered: true, onLoad: function(){setTimeout(function(){$j('#invitees').focus();},0);}});
        };

        /**
         *  Closes the Modal Dialog window containing this view, if it is open.
         *  @this {jive.invite.InviteView}
         */
        this.close = function(){
            this.$template.trigger('close');
        };

        /**
         * clears All errors reported and
         */
        this.clearErrors = function(){
            for(var invitee in this.invitees){
                this.invitees[invitee].reset();
            }
            for(var inviteeList in this.inviteeLists){
                this.inviteeLists[inviteeList].reset();
            }
        };

        //Might want to move this to an event handler and use the emit functionality to trigger error reporting

        this.addErrorMessage = function(message, identifier, isList){
            var invitee = this.getInviteeView(identifier, isList);
            invitee.addErrorMessage(message);
        };

        this.reportComplete = function(identifier, hasError, isList){
            var invitee = this.getInviteeView(identifier, isList);
            if(hasError){
                invitee.markError();
            }
            else {
                invitee.markSuccess();
            }
        };

        this.startProgress = function(){
            //todo find a better way to chose the context
            this.showSpinner({"inline" : true, "showLabel" : false, "context" : this.getContent().find(".j-form-buttons")});
        };

        this.setProgress = function(percentage){
            //this is here to support a progress meter if needed
            if(percentage >= 100){
                this.hideSpinner();
            }
        };


        protect.getInviteeView = function(identifier, isList){
            if(isList){
                return this.inviteeLists[identifier];
            } else {
                return this.invitees[identifier];
            }
        };

        protect.initialize = function(){
            this.invitees = {};
            this.inviteeLists = {};
            this.content = this.$template = $j(this.getSoyTemplate(this.params));
            var view = this;
            this.$form = this.$template.find("#jive-invite-form");
            this.autocomplete = new jive.UserPicker.Main({
                emailAllowed: this.params.inviteEmail,
                userAllowed: this.params.inviteUsers,
                valueIsUsername: this.params.inviteUsers,
                listAllowed: this.params.inviteUsers,
                canInvitePartners :this.params.canInvitePartners,
                canInviteJustPartners : this.params.canInviteJustPartners,
                canInvitePreprovisioned : this.params.canInvitePreprovisioned,
                invitePreprovisionedDomainRestricted : this.params.invitePreprovisionedDomainRestricted,
                domains: this.params.domains,
                multiple: true,
                trial: this.params.trial,
                maxSelectedCount: this.params.maxInviteCount,
                maxSelectedMessage: $j(jive.invite.maxInvitationsError(this.params)),
                selectionCallbacks: [this.updateInvitees],
                $input : this.$template.find("#invitees"),
                placeholder : " "
            });

            this.$form.submit(function(event){
                event.preventDefault();
                view.submit(this);
            });
        };

        protect.submit = function(form){
            var selected = this.autocomplete.getSelectedUsersAndLists();
            this.updateInvitees(this.$template, selected.users, selected.userlists);

            var users = this.getUsers();
            var lists = this.getLists();

            if(users.length > 0 || this.listsHasUsers(lists)){
                this.emit("submit", $j(form).find('textarea[name="message"]').val(), users, lists, this.getSelectedGroups(), this.getSelectedSpaces());
            } else {
                $j(jive.invite.requiredRecipientsError()).message({style: "error"});
            }
        };

        protect.listsHasUsers = function(lists){
            var result = false;
            if(lists.length > 0){
                 lists.forEach(
                    function(list, index){
                        if(list.users.length > 0){
                            result = true;
                        }
                    }
                 );
            }
            return result;
        };

        protect.getUsers = function(){
            var users = [];
            for(var key in this.invitees){
                var user = {};
                user.identifier = key;
                var invitee = this.invitees[user.identifier].getContent();
                user.id = invitee.data("user-id");
                user.userName = invitee.data("user-name");
                users.push(user);
            }
            return users;
        };

        protect.getLists = function(){
            var lists = [];
            for(var key in this.inviteeLists){
                var list = {};
                list.identifier = key;
                var inviteeList = this.inviteeLists[list.identifier].getContent();
                list.users=[];
                inviteeList.find("a.jive-username-link").each(
                    function(index, userLink){
                        var $userLink = $j(userLink);
                        var user = {};
                        user.userName = $userLink.data("username");
                        user.id = $userLink.data("userid");
                        list.users.push(user);
                    }
                );
                lists.push(list);
            }
            return lists;
        };

        protect.updateInvitees = function($results, users, lists){
            //This updates the collection of associated InviteeViews when ever the autocomplete changes values
            var view = this;
            this.invitees = {};
            this.inviteeLists = {};
            users.forEach(
                function(user, index){
                    var $targets = $results.find('[data-user-name="'+user.username+'"]');
                    view.invitees[user.username] = new jive.invite.InviteeView($targets);
                }
            );
            lists.forEach(
                function(list, index){
                    var $targets = $results.find('[data-list-id="'+list.id+'"]');
                    view.inviteeLists[list.id] = new jive.invite.InviteeView($targets);
                }
            );
        };

        protect.getSelectedGroups = function() {
          var gids = '';
          $j('select[name="recoGroup"]').change(function() {
            $j('select[name="recoGroup"] option:selected').each(function() {
              gids += $j(this).attr('value') + ",";    
            });
            $j('#selected-gids').text(gids);
          }).trigger('change');
          return gids;
        };

        protect.getSelectedSpaces = function() {
          var spids = '';
          $j('select[name="recoPages"]').change(function() {
            $j('select[name="recoPages"] option:selected').each(function() {
              spids += $j(this).attr('value') + ",";    
            });
            $j('#selected-spids').text(spids);
          }).trigger('change');
          return spids;
        };
    }
);
