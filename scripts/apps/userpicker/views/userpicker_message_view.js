/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals innerShiv */

jive.namespace('UserPicker');

/**
 * This class renders user-specific messages in the user picker.
 *
 * @depends path=/resources/scripts/jquery/jquery.popover.js
 * @depends template=jive.UserPicker.soy.limitMessage scope=client
 */
jive.UserPicker.Messages = jive.oo.Class.extend(function(protect) {

    this.init = function($input, options) {
        this.userMessages = options && options.userMessages || [];
        this.listMessages = options && options.listMessages || [];
        var view = this;
        $j('.j-user-autocomplete').focus(function(){
            view.hideUserMessages();
        });
        this.$permissionmsg = options && options.permissionsMessage;
        if (this.$permissionmsg) {
            $input.before(this.$permissionmsg.hide());
        }
        this.$relatedmsg = options && options.relatedMessage;
        if (this.$relatedmsg) {
            $input.before(this.$relatedmsg.hide());
        }
        // the message to display when the maxumum number of results is reached
        var defaultLimitMessage = jive.UserPicker.soy.limitMessage({limit: options.maxSelectedCount});
        this.$limitmsg = (options && options.maxSelectedMessage) || $j(defaultLimitMessage);
        if (this.$limitmsg){
            $input.before(this.$limitmsg.hide());
        }
    };

    this.showUserMessages = function(changes) {
        var view = this;
        if (changes.pasted && changes.pasted.length){
            view.handlePaste(changes.pasted);
        } else if (changes.added) {
            view.handleAdd(changes.added);
        }
    };

    protect.handlePaste = function (users) {
        var last, view = this;
        $j.each(users, function (i, user) {
            $j.each(view.userMessages, function (j, message) {
                var $ctx = view.renderMessage(user, message, false);
                last = {context:$ctx, user:user, message:message};
            });
        });
        if (users.length) {
            //need to time this out so message displays correctly in the case of loading spinner, etc
            setTimeout(function () {
                view.showMessage(last.user, last.message, last.context);
            }, 1000);
        }
    };

    protect.handleAdd = function (added) {
        var view = this;
        //if we have users, we're a list
        if (added.users) {
            $j.each(view.listMessages, function(i, message) {
                view.renderMessage(added, message, true);
            });
        } else {
            $j.each(added, function(i, addedUser){
                $j.each(view.userMessages, function(ii, message) {
                    view.renderMessage(addedUser, message, (i == added.length-1));
                });
            });
        }
    };

    protect.renderMessage = function(selected, message, show) {
        var view = this;
        var $ctx = view.getMessagePopoverContext(selected, message);
        if ($ctx.length) {
            var popoverSelector = view.getPopoverSelector(selected, message);
            $ctx.closest('.jive-chooser-list').parent().delegate(popoverSelector, 'click', function(e) {
                view.showMessage(selected, message, $j(popoverSelector));
                e.preventDefault();
            });
            if (show){
                view.showMessage(selected, message, $ctx);
            }
        }
        return $ctx;
    };

    protect.getPopoverSelector = function(selected, message){
        var view = this;
        return view.getItemSelector(selected) + " " + view.getMessagePopoverContextSelector(message);
    };

    protect.showMessage = function(selected, message, $ctx) {
        /*
         * JIVE-18511 Alright, look. You and I both know that a setTimeout call is not ideal here. I don't like it either,
         * you know.  I wish that we lived in a world where all browsers makers could work together to build a solid platform
         * on which we could build the web. But we don't.  We live in a world where IE hates you.  You don't know why, but
         * it does.
         *
         * I promise to explain the cause of the problem here in the comments of JIVE-18511. I humbly beg your forgiveness.
         */
        setTimeout(function() {
            var $popover = $j(message.render(selected)).popover({context: $ctx, position: 'right'});
            $popover.addClass("js-userpicker-user-msg");
            if (selected.id > 0) {
                if (selected.users){
                    $popover.parent('.js-pop').attr('data-list-id', selected.id);
                } else {
                    $popover.parent('.js-pop').attr('data-user-id', selected.id);
                }
            }
            else {
                $popover.parent('.js-pop').attr('data-user-email', selected.email);
            }
        }, 0);
    };

    protect.removeMessages = function(selected) {
        this.findPopoverForSelected(selected).remove();
    };

    protect.findPopoverForSelected = function(selected) {
       if (selected.id > 0) {
           if (selected.users){
               return $j('.js-pop[data-list-id="' + selected.id + '"]');
           } else {
               return $j('.js-pop[data-user-id="' + selected.id + '"]');
           }
        }
        else {
            return $j('.js-pop[data-user-email="' + selected.email + '"]');
        }
    };

    protect.getMessagePopoverContext = function(selected, message) {
        var view = this;
        var $item = view.getItem(selected);
        return $item.find(view.getMessagePopoverContextSelector(message));
    };

    protect.getItem = function(selected) {
        return $j(this.getItemSelector(selected));
    };

    protect.getItemSelector = function(selected) {
        if (selected.id > 0) {
            if (selected.users){
                return "li[data-list-id='" + selected.id + "']";
            } else {
                return "li[data-user-id='" + selected.id + "']";
            }
        } else if (selected.email) {
            return "li[data-user-email='" + selected.email + "']"
        }
        console.error("[no selector can be created for user or list: " + selected + "]")
    };

    protect.getMessagePopoverContextSelector = function(message) {
        if (message.popoverSelector) {
            return message.popoverSelector;
        } else if (message.type == 'info') {
            return "span.jive-icon-info:visible";
        } else if (message.type == 'warn') {
            return "span.jive-icon-warn:visible";
        } else if (message.type == 'error') {
            return "span.jive-icon-error:visible";
        } else if (message.type == 'success') {
            return "span.jive-icon-success:visible";
        }
    };

    this.hideUserMessages = function(){
        $j(".js-userpicker-user-msg").trigger('close');
    };

    this.togglePermissionMessage = function(hasPermission){
        if (this.$permissionmsg){
            if (hasPermission) {
                this.$permissionmsg.hide();
            }
            else {
                this.$permissionmsg.show();
            }
        }
    };

    this.toggleRelatedMessage= function(hasRelationship){
        if (this.$relatedmsg){
            if (hasRelationship) {
                this.$relatedmsg.hide();
            }
            else {
                this.$relatedmsg.show();
            }
        }
    };

    this.toggleLimitMessage = function(overLimit){
        if (this.$limitmsg){
            if (overLimit) {
                this.$limitmsg.show();
            }
            else {
                this.$limitmsg.hide();
            }
        }
    };

});