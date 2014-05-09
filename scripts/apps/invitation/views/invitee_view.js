/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('invite')

/*
 * @depends template=jive.shared.error.localizedFieldError
 * @depends template=jive.invite.errors
 * @depends template=jive.invite.status
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.invite.InviteeView =  jive.AbstractView.extend(
    function(protect) {
        this.init = function(content){
            this.content = $j(content);
            if (!this.$status){
                this.$status = $j(jive.invite.status());
                this.prepend(this.$status);
            }

            if (!this.$errors){
                this.$errors = $j(jive.invite.errors());
            }
        };

        this.markSuccess = function(){
            this.$status.addClass("jive-glyph-check").append("Success");
            this.$status.show();
        };

        this.markError = function(){
            var self = this;
            var $view = this.getContent();
            this.$status.addClass("jive-icon-redalert").append("Error");
            this.$status.show();
            this.addClass("list-item-error");
            this.$status.click(
                function(){
                    if(!self.popover){
                        var icon = $j(this);
                        self.$errors.popover({context: $j(this), putBack: true, returnPopover: true, destroyOnClose: false, container: $view
                            .closest('.j-modal'), onClose: function() {self.popover = false;}
                        });
                        self.popover = true;
                    }
                }
            );
        };

        this.addErrorMessage = function(message){
            this.$errors.append($j(jive.shared.error.localizedFieldError({"message" : message})));
        };

        this.reset = function(){
            this.$errors.empty();
            this.$status.empty();
            this.$status.removeClass("jive-glyph-check jive-icon-redalert").html("");
            this.removeClass("list-item-error");
        };
    }
);