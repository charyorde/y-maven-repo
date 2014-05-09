/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActionQueue');

jive.ActionQueue.ListItemView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.itemID = options.itemID;
        this.creationDate = options.creationDate;
    };

    protect.getSoyTemplate = function(data) {
        return jive.eae.actionqueue.actionQueueItemView(data);
    };

    this.postRender = function() {
        var self = this,
            content = self.getContent();
        content.find('.j-action-button').unbind();
        content.find('.j-action-button').click(function(e) {
            // expand button has been clicked
            var name = $j(this).attr('name');
            if (!name) {
                $j(".j-loading-bg").show();
                return; // no code, this link is not handled by javascript
            }
            var actionCode = parseInt(name),
                $this = $j(this),
                message = '';

            self.emitP('performAction', self.itemID, actionCode, message);
            e.preventDefault();
        });

        content.find(".j-actionQ-detail-show, .j-actionQ-detail-hide").unbind();
        content.find(".j-actionQ-detail-show").click(function() {
            // perhaps this should be wired through an event?
            content.find(".j-aq-detail").slideDown('fast', function() {
                content.find(".j-actionQ-detail-show").hide();
                content.find(".j-actionQ-detail-hide").fadeIn('fast');
            });
        });
        content.find(".j-actionQ-detail-hide").click(function() {
            // perhaps this should be wired through an event?
            content.find(".j-aq-detail").slideUp('fast', function() {
                content.find(".j-actionQ-detail-hide").hide();
                content.find(".j-actionQ-detail-show").fadeIn('fast');
            });
        });
    };

    this.actionTaken = function(data) {
        var self = this,
            $article = self.getContent();
        if (data.templateData && data.templateData.template) {
            if (typeof data.templateData.overrideFadeout == "undefined" || (typeof data.templateData.overrideFadeout != "undefined" && !data.templateData.overrideFadeout)) {
                $article.fadeOut('fast', function() {
                    // if has a result template
                    if (data.templateData && data.templateData.template) {
                        $resultOutput = $j(jive.eae.actionqueue.actionQueueItemActionResult({data:data}));
                        $article.html($resultOutput);
                        $article.addClass('j-aq-processed');
                        $article.fadeIn('fast', function() {
                            window.setTimeout(function() {
                                $article.fadeOut('fast', function() {
                                    // fire event to update list
                                    $article.remove();
                                    self.emit('actionCompleted', {itemID: self.itemID});
                                });
                            }, data.notificationTimeout);
                        });
                    }
                    else {
                        $article.remove();
                        self.emit('actionCompleted', {itemID: self.itemID});
                    }
                });
            }
            else {
                $resultOutput = $j(jive.eae.actionqueue.actionQueueItemActionResult({data:data}));
                $article.html($resultOutput);
                $article.find('.j-action-result').removeClass('j-action-result');
                self.emit('actionCompleted', {itemID: self.itemID});
            }
        }
        else {
            $article.fadeOut('fast', function() {
                $article.remove();
                self.emit('actionCompleted', {itemID: self.itemID});
            });
        }
    };

    this.getID = function() {
        return this.itemID;
    };

    this.getCreationDate = function () {
        return this.creationDate;
    }
});


