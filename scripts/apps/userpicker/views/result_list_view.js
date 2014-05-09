jive.namespace('UserPicker');

/**
 * A view class for the list of results that comes from the autocomplete call.
 *
 * @depends template=jive.UserPicker.soy.renderUserList
 * @depends template=jive.UserPicker.soy.pleaseEnterEmail
 * @depends template=jive.UserPicker.soy.pleaseEnterValidDomain
 * @depends template=jive.UserPicker.soy.pleaseEnterValidEmail
 * @depends template=jive.UserPicker.soy.noUsersMatchMessage
 */
jive.UserPicker.ResultListView = jive.oo.Class.extend(function (protect) {
    jive.conc.observable(this);

    this.init = function (opts) {
        var view = this;

        this.$chooser = opts.$chooser;
        this.$input = opts.$input;
        this.hidden = true;

        this.emailAllowed = opts.emailAllowed;
        this.userAllowed = opts.userAllowed;
        this.listAllowed = opts.listAllowed;
        this.trial = opts.trial;
        this.canInvitePartners = opts.canInvitePartners;
        this.canInvitePreprovisioned = opts.canInvitePreprovisioned;
        this.invitePreprovisionedDomainRestricted = opts.invitePreprovisionedDomainRestricted;
        this.domains = opts.domains || [];

        this.onShow = opts.onShow     || $j.noop;
        this.onHide = opts.onHide     || $j.noop;
        this.onSelect = opts.onSelect || $j.noop;

        this.$input.after(this.$chooser);

        this.$chooser
        .hide()
        .on('mouseover', 'a', function() {
            view.highlightRow($j(this).closest('li'));
        })
        .on('click', 'a', function(event) {
            event.preventDefault();
            view.emit('select', this);
            view.onSelect.call(null, this);
        });
    };

    /**
     * the following functions are responsible for
     * setting the highlight style for the rows
     * in the dropdown
     * @param $item
     */
    this.highlightRow = function ($item) {
        this.clearExtraInfo();
        this.findSelectedItem().removeClass("hover");
        this.showExtraInfo($item.addClass("hover"));
    };

    this.clearHighlight = function () {
        var $item = this.findSelectedItem();
        $item.removeClass("hover");
    };

    this.highlightFirst = function () {
        this.findSelectedItem().removeClass("hover");
        this.showExtraInfo(this.$chooser.find("li:first").addClass("hover"));
    };

    this.highlightNext = function () {
        var that = this;
        that.clearExtraInfo();
        var $item = this.findSelectedItem();
        if ($item.next().length) {
            that.showExtraInfo($item.removeClass("hover").next().addClass("hover"));
        } else if ($item.parent("ul").nextAll("ul:first").length) {
            that.showExtraInfo($item.removeClass("hover").parent("ul").nextAll("ul:first").find("li:first")
                .addClass("hover"));
        }
    };

    this.highlightPrev = function () {
        var that = this;
        that.clearExtraInfo();
        var $item = that.findSelectedItem();
        if ($item.prev().length) {
            that.showExtraInfo($item.removeClass("hover").prev().addClass("hover"));
        } else if ($item.parent("ul").prevAll("ul:first").length) {
            that.showExtraInfo($item.removeClass("hover").parent("ul").prevAll("ul:first").find("li:last")
                .addClass("hover"));
        }
    };

    protect.clearExtraInfo = function () {
        this.$chooser.find(".j-select-user-extra-info").hide();
    };

    protect.showExtraInfo = function ($item) {
        $item.find(".j-select-user-extra-info").show();
    };

    this.findSelectedItem = function () {
        return this.$chooser.find("li.hover");
    };

    this.render = function(results){
        var msg = this.getMessage();
        this.$chooser.html(jive.UserPicker.soy.renderUserList({results : results, noResultsMessage : msg}));
        this.show();
    };

    protect.getMessage = function(){
        var msg;
        if (this.emailAllowed && !this.userAllowed && !this.listAllowed) {
            if (this.isValidEmailAddressFragment(this.$input.val())) {
                if (this.domains.length > 0 && !this.canInvitePartners) {
                    msg = jive.UserPicker.soy.pleaseEnterValidDomain({trial:this.trial, domains:this.domains});
                }
                else {
                    msg = jive.UserPicker.soy.pleaseEnterEmail({});
                }
            }
            else {
                msg = jive.UserPicker.soy.pleaseEnterValidEmail({});
            }
        } else if (this.emailAllowed) {
            //if it's definitely an email address that the user is entering, guide them to do so
            if (this.isEmailAddressInput(this.$input.val())){
                if (this.domains.length > 0 && !this.canInvitePartners) {
                    msg = jive.UserPicker.soy.pleaseEnterValidDomain({trial:this.trial, domains:this.domains});
                }
                else {
                    msg = jive.UserPicker.soy.pleaseEnterEmail({});
                }
            } else {
                msg = jive.UserPicker.soy.noUsersMatchMessage({trial:this.trial, domains:this.domains, emailAllowed: true});
            }
        }
        else {
            msg = jive.UserPicker.soy.noUsersMatchMessage({emailAllowed: true});
        }
        return msg;
    };

    this.show = function() {
        var view = this;

        this.$chooser
        .show()
        .css({
            left : this.$input.position().left,
            top : this.$input.position().top + this.$input.outerHeight()
        });

        if (this.hidden) {
            if (this._blurHandler) {
                $j(document).off('focus click', 'body', this._blurHandler);
            }

            this._blurHandler = function(event) {
                var $target = $j(event.target)
                  , isInput = event.target == view.$input.get(0)
                  , inCompletionsList = $target.closest(view.$chooser).length > 0;

                if (!isInput && !inCompletionsList) {
                    view.hide();
                }
            };

            // We have to use a slightly weird delegate syntax here to
            // activate jQuery's workaround for the fact that 'focus'
            // events do not natively bubble.
            $j(document).on('focus click', 'body', this._blurHandler);

            this.emit('show');
            this.hidden = false;
            this.onShow.call(null);
        }
    };

    this.hide = function() {
        this.$chooser.hide();

        if (this._blurHandler) {
            $j(document).off('focus click', 'body', this._blurHandler);
            delete this._blurHandler;
        }

        if (!this.hidden) {
            this.emit('hide');
            this.hidden = true;
            this.onHide.call(null);
        }
    };

    this.resultSize = function(){
        return this.$chooser.find("li").size();
    };

    this.findNameMatches = function(token){
        return this.$chooser.find("li a").filter(function(i, anchor){
            return $j(anchor).data('user-username').toLowerCase().trim().startsWith(token) || jive.util.equalsIgnoreCaseAndPadding(token, $j(anchor).data('user-name'));
        });
    };

    protect.isEmailAddressInput = function(emailAddress) {
        return emailAddress.match("^([\\w\\.!#$%&*\\+/?\\^`{}\\|~_'=-]+)@([\\w\\.-]+)?$");
    };

    protect.isValidEmailAddressFragment = function(emailAddress) {
        //regex is reused from StringUtils#isValidEmailFragment but matches any domain
        return emailAddress.match("^([\\w\\.!#$%&*\\+/?\\^`{}\\|~_'=-]+)@?([\\w\\.-]+)?$");
    };

});
