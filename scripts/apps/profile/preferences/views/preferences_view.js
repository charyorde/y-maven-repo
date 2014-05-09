/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ProfilePreferences');

/**
 *
 * @extends jive.AbstractView
 * @depends template=jive.eae.activitystream.builder.hiddenRulesContent
 * @depends template=jive.eae.activitystream.builder.noHiddenRules
 */
jive.ProfilePreferences.PreferencesView = jive.AbstractView.extend(function(protect) {

    this.init = function (options) {
        var preferencesView = this;

        $j('#j-edit-hidden-rules').delegate('.j-js-edit-hidden-rules', 'click', function(e) {
            preferencesView.emitP('getHiddenRules').addCallback(function(data) {
                preferencesView.showHiddenRulesModal(data);
            });
            e.preventDefault();
        });
    };

    this.showHiddenRulesModal = function(rulesData) {
        var preferencesView = this,
            $modalContent = $j(jive.eae.activitystream.builder.hiddenRulesContent({'rulesData': rulesData}));
        $modalContent.lightbox_me({
            destroyOnClose: true,
            centered: true,
            onLoad:function() {
                preferencesView.attachHiddenRulesListeners($modalContent);
            }
        });
    };

    this.attachHiddenRulesListeners = function($modalContent) {
        var preferencesView = this;
        $modalContent.delegate('a.j-js-rule-undo, a.j-js-rule-redo', 'click', function(e) {
            var $ruleLink = $j(this),
                hideType = ($ruleLink.is('.j-js-rule-undo') ? 'include' : 'exclude'),
                $ruleItem = $ruleLink.closest('li'),
                rulesType = $ruleLink.closest('.j-js-hiding-rules').data('type'),
                data = {'ruleType': rulesType,
                    'hideType': hideType,
                    'objectType': $ruleItem.data('objecttype'),
                    'objectID': $ruleItem.data('objectid')};
            if (rulesType == 'type-context') {
                data.contentType = $ruleItem.data('contenttype');
            }
            preferencesView.emitP('hidingRuleAction', data).addCallback(function() {
                $ruleItem.hide();
                if (hideType == 'include') {
                    $ruleItem.next('.j-js-undone-hiding-rule').fadeIn('fast');
                }
                else {
                    $ruleItem.prev('.j-js-hiding-rule').fadeIn('fast');
                }
            });
            e.preventDefault();
        }).delegate('a.j-js-rule-dismiss', 'click', function(e) {
            var $ruleLink = $j(this),
                $ruleItem = $ruleLink.closest('li');
            $ruleItem.fadeOut('fast', function() {
                $ruleItem.prev('.j-js-hiding-rule').remove();
                $ruleItem.remove();
                if (!$modalContent.find('li').length) {
                    $j('#j-hiding-rules-sections').html(jive.eae.activitystream.builder.noHiddenRules());
                }
            });
            e.preventDefault();
        });
    };
});
