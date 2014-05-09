/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('ShareApp');

/**
 * jive.Share.Content.ShareView
 * 
 * View class for handling click event to show share model and handles save and cancels clicks.
 *
 * @depends path=/resources/scripts/jquery/jquery.lightbox_me.js
 * @depends path=/resources/scripts/apps/userpicker/main.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template=jive.error.rest.soy.errorFinding
 * @depends template=jive.error.rest.soy.errorUpdating
 * @depends template=jive.soy.share.*
 */
jive.ShareApp.ShareView = jive.oo.Class.extend(function(protect) {	

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function() {
        this.recipients = [];
        this.options = {};
    };

    protect.submitShare = function(objectID, objectType, $modalDiv, objectName) {

        var view = this;
        var data = {
            message    : $j('#jive-send-content-not-message').val(),
            recipients: view.buildRecipientArray(),
            subject    : $j('#jive-send-content-not-subject').val()
        };

        // message is supposed to be text only, server-side rendering will barf on any unknown
        // html-element-like text, escape 'em
        data.message = data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        view.emitP('share', objectType, objectID, data).addCallback(function() {
            // todo: redirect logic if can no longer view group.
            $j(jive.soy.share.shareConfirmation({objectName:objectName})).message({style: 'success'});
             $modalDiv.trigger('close');

            if (view.recipients.some(function(recipient) {
                return recipient.id !== window._jive_current_user.ID;
            })) {
                jive.dispatcher.dispatch("trial.share.created");
                jive.dispatcher.dispatch("trial.updatePercentComplete");
            }
            view.recipients = [];

        })
            .addErrback(function(message) {
                var content = message ? $j('<p>' + message + '</p>') :
                    $j(jive.error.rest.soy.errorUpdating({ href: window.location }));
                content.message({ showClose: true, style:'error' });
                $modalDiv.find('input, button').prop('disabled', false);
            });
    };

    protect.buildRecipientArray = function(){
        var view = this;
        var recipientArray = [];

        // Make sure that recipients list is up-to-date.
        this.checkExternalUsers(this.userPicker.getSelectedUsersAndLists(true));

        return this.recipients.map(function(recipient) {
            return {
                identifier: recipient.email,
                notified: recipient.notified
            };
        });
    };

    protect.checkExternalUsers = function(data) {
        var view = this;

        $j('#jive-include-attach-div').hide();
        data.users.forEach(function(user) {
            if (user.id == -1 || !user.entitled) {
                $j('#jive-include-attach-div').show();
            }
        });

        // Remove recipients that are no longer selected.
        this.recipients = this.recipients.filter(function(recipient) {
            return data.users.some(function(selectedUser) {
                return selectedUser.email === recipient.email;
            });
        });

        // Add recipients that have just been selected.
        var added = this.addedRecipients(data.users);
        this.recipients = this.recipients.concat(added);
    };

    protect.addedRecipients = function(selectedUsers) {
        var view = this;
        return selectedUsers.filter(function(selectedUser) {
            return !view.recipients.some(function(recipient) {
                return selectedUser.email === recipient.email;
            });
        }).map(function(selectedUser) {
            return $j.extend({}, selectedUser, { notified: false });
        });
    };

    protect.recipient = function(email) {
        return this.recipients.filter(function(recipient) {
            return recipient.email === email;
        });
    };

    protect.notifyUser = function(email, notified) {
        this.recipient(email).forEach(function(r) { r.notified = notified; });
        $j('.js-notify-user').toggle();
        $j('.js-unnotify-user').toggle();
    };

    /**
     * Shows the Share modal
     *
     * @param {number} objectID
     * @param {number} objectType
     * @public
     */
    this.openShareModal = function(objectID, objectType) {
        var view = this;

        // emit a leave event to the controller, along with a callback that contains
        // default share message for modal
        // todo: add a modal loading spinner here prior to loading the modal.
        view.emitP('prepareShare', objectType, objectID).addCallback(function(data) {
            if (!view.open) {
                view.open = true;
                // todo: close the modal loading spinner

                if (data.invitationsEnabled) {
                    view.options.invitationsEnabled = true;
                }

                view.recipients = [];

                if (data.secretGroup) {
                    $j(jive.soy.share.secretGroupMessage()).message({ showClose: true, style:'error' });
                }
                else {

                    var $modal = $j(jive.soy.share.share(data));
                    $modal.lightbox_me({destroyOnClose: true, centered: true,
                        onLoad: function() {
                            $modal.find('input:visible:first').focus();
                            jive.dispatcher.dispatch('trial.share.modal.loaded');
                        },
                        onClose: function() {
                            view.cleanupModal();
                        }
                    });

                    $modal.find('form').submit(function() {
                        $j(this).find('input,button').prop('disabled', true);
                        view.submitShare(objectID, objectType, $modal, data.objectNameCapital);
                        return false;
                    });

                    var picker = new jive.UserPicker.Main({
                        multiple: true,
                        listAllowed: true,
                        emailAllowed: data.externallyShareable,
                        message: '',
                        object: {objectID : objectID, objectType: objectType},
                        entitlement: "VIEW",
                        $input : $j("#share-users"),
                        canInvitePartners: data.attachmentAvailable,
                        canInviteJustPartners: false,
                        canInvitePreprovisioned: true,
                        relatedMessage: $j(jive.soy.share.usersNotRelated()),
                        userMessages: [view.getUserPermissionsMessage(data)],
                        listMessages: [view.getListPermissionsMessage(data)],
                        placeholder : " "
                    });
                    picker.addListener('selectedUsersChanged', function(data) {
                        view.checkExternalUsers(data);
                    });
                    view.userPicker = picker;

                    var $body = $j('body');

                    $body.delegate('.js-notify-user', 'click', function(e) {
                        view.notifyUser($j(this).data('user-identifier'), true);
                        e.preventDefault();
                    });

                    $body.delegate('.js-unnotify-user', 'click', function(e) {
                        view.notifyUser($j(this).data('user-identifier'), false);
                        e.preventDefault();
                    });
                }
            }
        })
        .addErrback(function(message) {
            var content = message ? $j('<p>' + message + '</p>') :
                $j(jive.error.rest.soy.errorFinding({ href: window.location }));
            content.message({ showClose: true, style:'error' });
        });
    };

    protect.cleanupModal = function(){
        var view = this;
        $j(".js-userpicker-user-msg").trigger('close');
        var $body = $j('body');
        $body.undelegate('.js-notify-user', 'click');
        $body.undelegate('.js-unnotify-user', 'click');
        view.open = false;
    };

    protect.getUserPermissionsMessage = function(data){
        var view = this;
        return {
            type: 'warn',
            render: function(user){
                user.notified = view.recipient(user.email).some(function(r) {
                    return r.notified;
                });
                var templateData = $j.extend({user: user}, data);
                return jive.soy.share.userWithoutPermission(templateData);
            }
        };
    };

    protect.getListPermissionsMessage = function(data){
        var view = this;
        return {
            type: 'warn',
            render: function(){
                return jive.soy.share.listWithoutPermission(data);
            }
        };
    };
});
