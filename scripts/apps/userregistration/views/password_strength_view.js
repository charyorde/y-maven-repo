jive.namespace('UserRegistration');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.user.registration.passwordStrengthMessageUnknown
 * @depends template=jive.user.registration.passwordStrengthMessageHigh
 * @depends template=jive.user.registration.passwordStrengthMessageMediumHigh
 * @depends template=jive.user.registration.passwordStrengthMessageMedium
 * @depends template=jive.user.registration.passwordStrengthMessageLow
 */
jive.UserRegistration.PasswordStrengthView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.initView = function() {
        var view = this;
        var $form = $j('#jive-user-registration-form');
        view.initPattern($form);
        view.initTips($form);
    };

    protect.initPattern = function($form) {

        var view = this;
        var $passField = $form.find("input[name='password']");
        view.patPassMinLen = $passField.data('minlengthpattern') || '.{6,}';

        //build up regex
        view.patPassMin = new RegExp(view.patPassMinLen);
        view.patPassBetter = new RegExp(".{8,}");
        view.patPassLC = new RegExp("[a-z]");
        view.patPassUC = new RegExp("[A-Z]");
        view.patPassNum = new RegExp("[0-9]");
        view.patPassPunc = new RegExp("[-_\\W]");
    };

    protect.initTips = function($form) {
        var view = this;
        var $pw_tips = $j("#jive-pw-strength");
        $form.find("input").blur(
            function() {
                var $blurredElement = $j(this);
                //TODO: don't hide tips when going from one password element to the other
                if ($blurredElement.attr('type') == 'password') {
                    view.hideEle($pw_tips, true);
                }
            }).focus(
            function() {
                var $focusedElement = $j(this);
                $focusedElement.select();
                if ($focusedElement.attr('type') == 'password') {
                    view.showEle($pw_tips, true);
                }
            });

        $form.find("input[type='password']").keyup(function() {
            view.getPasswordStrength($j(this).val());
        });
    };

    protect.getPasswordStrength = function(text) {
        var view = this;
        view.emitP('passwordstrength', text).addCallback(function(strength) {
            view.updatePasswordStrengthMessage(strength, text);
        });
    };

    protect.updatePasswordStrengthMessage = function(strength, text) {
        var view = this;
        var innerText = jive.user.registration.passwordStrengthMessageUnknown();
        var pwClass = "jive-pw-null";
        if ("HIGH" == strength) {
            innerText = jive.user.registration.passwordStrengthMessageHigh();
            pwClass = "jive-pw-strong";
        }
        if ("MEDIUMHIGH" == strength) {
            innerText = jive.user.registration.passwordStrengthMessageMediumHigh();
            pwClass = "jive-pw-good";
        }
        else if ("MEDIUM" == strength) {
            innerText = jive.user.registration.passwordStrengthMessageMedium();
            pwClass = "jive-pw-fair";
        }
        else if ("LOW" == strength) {
            innerText = jive.user.registration.passwordStrengthMessageLow();
            pwClass = "jive-pw-weak";
        }
        $j("#jivePwStrength").text(innerText);
        $j("#jive-pw-strength").attr("class", pwClass);
        $j("#jive-pw-strength").addClass("jive-pw-show-tips");
        view.checkPwCharTypes(text);
    };

    protect.checkPwCharTypes = function(text) {
        var view = this;
        var tips = $j("#jive-pw-tips li .jive-icon-sml");
        tips.attr({"class": "jive-icon-sml jive-icon-forbidden"});

        if (view.patPassMin.test(text)) {
            $j("#pw-tip-min-length .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
        if (view.patPassBetter.test(text)) {
            $j("#pw-tip-recommend-length .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
        if (view.patPassLC.test(text)) {
            $j("#pw-tip-lowercase .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
        if (view.patPassUC.test(text)) {
            $j("#pw-tip-uppercase .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
        if (view.patPassNum.test(text)) {
            $j("#pw-tip-numeral .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
        if (view.patPassPunc.test(text)) {
            $j("#pw-tip-punctuate .jive-icon-sml").addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        }
    };

    protect.showEle = function($ele, animate) {
        if (animate) {
            $ele.animate({"opacity": 1}, 300);
        } else {
            $ele.css({"opacity": 1});
        }
        $ele.addClass("jive-pw-show-tips").removeClass("jive-pw-hide-tips");
    };

    protect.hideEle = function($ele, animate) {
        var view = this;
        if (animate) {
            $ele.animate({"opacity": 0}, 300);
        } else {
            $ele.css({"opacity": 0});
        }
        $ele.addClass("jive-pw-hide-tips").removeClass("jive-pw-show-tips");

    };

});