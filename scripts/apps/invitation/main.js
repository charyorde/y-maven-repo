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
 * @depends path=/resources/scripts/apps/invitation/views/invite_view.js
 * @depends path=/resources/scripts/apps/invitation/models/invite_source.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends template=jive.invite.error
 * @depends template=jive.invite.success
 */
define('jive.invite.Main', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {
        var namespace = jive.invite;
        this.init = function(container, company, domains, allowEmail, allowUsers, canInvitePartners, canInviteJustPartners, canInvitePreprovisioned, invitePreprovisionedDomainRestricted, maxInvite, invitePeriod, message, trial, trigger, trackingID){
            var main = this;
            this.container = container;
            this.canInvitePartners = canInvitePartners;
            this.canInviteJustPartners = canInviteJustPartners;
            this.canInvitePreprovisioned = canInvitePreprovisioned;
            this.invitePreprovisionedDomainRestricted = invitePreprovisionedDomainRestricted;
            this.view = new namespace.InviteView(container, company, domains, allowEmail, allowUsers, canInvitePartners, canInviteJustPartners, canInvitePreprovisioned, invitePreprovisionedDomainRestricted, maxInvite, invitePeriod, message, trial, trigger);
            this.view.addListener("submit", function(message, users, lists, gids, spids){main.processInvites(message, users, lists, gids, spids);});
            this.hasErrors = false;
            this.trackingID = trackingID;
        };

        /* create a pool out outbound calls and wait for each to return if they do not all return then there is an error, but the timeout should handle that
           * this is because of the decision to keep the service standardized and we have not standardized bulk processing
            */

        protect.processInvites = function(message, users, lists, gids, spids){
            var main = this;
            main.source = new jive.invite.InviteSource({trackingID: this.trackingID || null, gids: gids, spids: spids});
            var view = this.view;
            this.resetErrors();
            view.startProgress();
            var invitationsSent = [];
            var expected = users.length + lists.length;
            var complete = 0;
            var existing = 0;
            users.forEach(
                function(user, index){
                    if (-1 == $j.inArray(user.userName, invitationsSent)) {
                        invitationsSent.push(user.userName);
                        var userHasError = false;
                        var userExists = false;
                        var identifier = user.identifier;
                        var invite = createInvite(main.container, message, _jive_effective_user_id, user);
                        //start progress spinner (and progress bar if possible)
                        main.source.save(invite)
                        .addErrback(
                            function(message, code, status){
                                if(code == 4004) { // ERROR_CODE_ALREADY_EXISTS
                                    userExists = true;  // Not really an error, just need to keep track
                                } else {
                                    userHasError = true;
                                    if(status != 400){
                                        main.source.showGenericSaveError();
                                    }
                                    main.addError(identifier, message, code);
                                }
                            }
                        ).always(
                            function(){
                                if (userExists) {
                                    existing++;
                                } else {
                                    complete++;
                                }
                                expected--;
                                main.completeTask(identifier, userHasError);
                                if(expected == 0){
                                    main.complete(complete, existing);
                                }
                            }
                        ).addCallback(function(){
                            jive.switchboard.emit('invitation.create', invite);
                        });
                    } else {
                        expected--;
                    }
                }
            );
            lists.forEach(
                function(list, index){
                    var listExpected = list.users.length;
                    var listError = false;
                    var identifier = list.identifier;
                    list.users.forEach(
                        function(user, index){
                            if (-1 == $j.inArray(user.userName, invitationsSent)) {
                                invitationsSent.push(user.userName);

                                var userExists = false;
                                var invite = createInvite(main.container, message, _jive_effective_user_id, user);
                                //no call back because call back just needs to be captures
                                main.source.save(invite)
                                .addErrback(
                                    function(message, code, status){
                                        if(code == 4004) { // ERROR_CODE_ALREADY_EXISTS
                                            userExists = true;  // Not really an error, just need to keep track
                                        } else {
                                            listError = true;
                                            if(status != 400){
                                                main.source.showGenericSaveError();
                                            }
                                            main.addError(identifier, message, code, true);
                                        }
                                    }
                                ).always(
                                    function(){
                                        if (userExists) {
                                            existing++;
                                        } else {
                                            complete++;
                                        }
                                        listExpected--;
                                        if(listExpected == 0){
                                            expected--;
                                            main.completeTask(identifier, listError, true);
                                        }
                                        if(expected == 0){
                                            main.complete(complete, existing);
                                        }
                                    }
                                ).addCallback(function(){
                                    jive.switchboard.emit('invitation.create', invite);
                                })
                            } else {
                                listExpected--;
                                if (listExpected == 0) {
                                    expected--;
                                }
                            }
                        }
                    );
                }
            );
        };

        function createInvite(container, message, inviterId, invitee){
            var invite = {};
            invite.body = message;
            invite.inviter = {};
            //TODO might want to move this to a supplied param
            invite.inviter.id = inviterId;
            invite.user = {};
            if(invitee.id > 0){
                invite.user.username = invitee.userName;
            }
            else
            {
                invite.email = invitee.userName;
            }
            invite.object = {};
            invite.object.objectType = container.type;
            invite.object.id = container.id;
            return invite;
        }

        protect.complete = function(totalUserCount, existingUserCount){
            this.view.setProgress(100);
            if(this.hasErrors){
                //global message that errors occured
                //this.source.showGenericSaveError();
                //$j("Errors Occurred while saving invitations.  Please see individual results.").message({style: "error"});
                $j(jive.invite.error()).message({style: "error"});
            } else {
                //global message that processing was succesful
                $j(jive.invite.success({containerName: this.container.name, memberCount: totalUserCount, existingCount: existingUserCount})).message({style: "success"});
                this.view.close();
            }
        };

        protect.resetErrors = function(){
            this.hasErrors=false;
            this.view.clearErrors();
        };
        protect.addError = function(invitee, message, code, isList){
            this.hasErrors = true;
            this.view.addErrorMessage(message, invitee, isList);
        };

        protect.completeTask = function(invitee, hasError, isList){
            this.view.reportComplete(invitee, hasError, isList);
        }

    });
});
