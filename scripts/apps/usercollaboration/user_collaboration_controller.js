/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('UserCollaboration');

/**
 * Controller for EAE activity Stream
 *
 * @class
 *
 * @depends path=/resources/scripts/apps/userpicker/main.js
 * @depends path=/resources/scripts/apps/usercollaboration/models/user_collaboration_source.js
 */
jive.UserCollaboration.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.UserCollaboration;

    this.init = function (options) {
        var main = this;

        this.model = new _.Model(options);

        main.participants = options.participants;
        main.objectuser = options.objectuser;
        main.currentUser = options.currentUser;
        main.item = options.item;
        main.participantsInput = options.participantsInput;
        main.form = options.form;
        main.finishedCallback = options.finishedCallback;

        var temp = (function(){
            var obj = {};
            obj.userlists = [];
            obj.users = [];

            for (var i = 0, participantLength = main.participants.length; i < participantLength; i++) {
                var userIter = main.participants[i];

                obj.users.push({
                    id: userIter.id,
                    anonymous : userIter.anonymous,
                    enabled: userIter.enabled,
                    visible: userIter.visible,
                    objectType : userIter.objectType,
                    username : userIter.username,
                    email : userIter.email,
                    entitled : userIter.entitled,
                    prop:       { directMessageActionLinkShown: true, isVisibleToPartner: userIter.prop.isVisibleToPartner },
                    avatarID: userIter.avatarID,
                    displayName: userIter.displayName,
                    disabled: true //applies to take action on the selected user, unrelated to 'enabled' param
                });
            }
            obj.users.push({
                id: main.objectuser.id,
                anonymous : main.objectuser.anonymous,
                enabled: main.objectuser.enabled,
                visible: main.objectuser.visible,
                objectType : main.objectuser.objectType,
                username : main.objectuser.username,
                email : main.objectuser.email,
                entitled : main.objectuser.entitled,
                prop:       { directMessageActionLinkShown: true, isVisibleToPartner: main.objectuser.prop.isVisibleToPartner },
                avatarID: main.objectuser.avatarID,
                displayName: main.objectuser.displayName,
                disabled: true //applies to take action on the selected user, unrelated to 'enabled' param
            });
        return obj;
        })();

        var autocomplete = new jive.UserPicker.Main({
            multiple: true,
            listAllowed: true,
            startingUsers: temp,
            disabled: false,
            canInvitePartners: true,
            $input : main.participantsInput,
            relatedMessage : $j(jive.soy.direct_messaging.notRelated())
        });

        main.form.submit(function(event) {
            var newCollaborators = main.form.find('input[name="participants"]').val(),
                newCollaboratorIDs = newCollaborators.split(",");
            // need to remove the message creator from these ids
            for(var i = 0; i < newCollaboratorIDs.length; i++) {
                if (newCollaboratorIDs[i] == main.objectuser.id) {
                    newCollaboratorIDs.splice(i,1);
                    break;
                }
            }
            newCollaborators = newCollaboratorIDs.join(",");

            if (main.item.typeShare) {
                main.model.addShareCollaborators(main.item.id, newCollaborators).addCallback(function(resp) {
                    main.finishedCallback(resp);
                    main.form.closest('.jive-modal').trigger('close');
                }).addErrback(function(data) {
                    $j("<div>"+data+"</div>").message({style: 'error'});
                });
            }
            else {
                main.model.addCollaborators(main.item.id, newCollaborators).addCallback(function(resp) {
                    main.finishedCallback(resp);
                    main.form.closest('.jive-modal').trigger('close');
                }).addErrback(function(data) {
                    $j("<div>"+data+"</div>").message({style: 'error'});
                });
            }

            event.preventDefault();
        });
    };
});
