jive.namespace('DirectMessaging');

/**
 * @depends path=/resources/scripts/apps/microblogging/views/status_input_common_view.js
 * @depends template=jive.statusinput.mention_warnings.jsI18nHelper
 * @depends i18nKeys=tinymce.jivemention.no_notification
 * @depends i18nKeys=tinymce.jivemention.secret_group
 * @depends i18nKeys=tinymce.jivemention.restricted_content
 */

jive.DirectMessaging.MicroBloggingView = jive.MicroBlogging.CommonView.extend(function(protect, _super) {
    this.init = function(options) {
        _super.init.call(this, $j.extend({}, options || {}, { doNotAnimate: true }));
    };

    this.getMessage = function() {
        return this.statusInput.getSubmitVals(false) || '';
    };

    this.createFormElem = function() {
        this.$formElem = this.getContent().closest('form:eq(0)');
        this.$imageFormElem = this._getMetaImageContainer().find('form');

        // make sure that the message text area is not skipped for tab navigation
        this.getContent().closest('form').keydown(function(e) {

            var TABKEY = 9;
            if (e.keyCode == TABKEY && e.target == $j(".jive-chooser-browse").get(0)) {

                $j('#message-direct-message-text').focus();

                if (e.preventDefault) {
                    e.preventDefault();
                }

            }


        });
    };

    this.createWaitingViewElem = function(){
        this.$waitingViewElem = this.getContent();
    };

    this._getAttachmentsViewOptions = function() {
        return { selector: '#jive-modal-direct-messaging .jive-js-attachment-container' };
    };

    this._getMetaImageContainer = function() {
        return this.getContent().closest('form').next().find("div.j-meta-image-container");
    };

    /*
     * There is a click event attached to the form submit button in the parent class.  This is interfering with the
     * handling of the form submit action elsewhere. This overriding of handleSubmitClick must happen as long as that
     * click event is attached.
     */
    this.handleSubmitClick = function(e) {};

    this.handleAtMentionResult = function (id, name) {
        var that = this;
        if (id && id.split("-").length == 2) {
            var mentionObjectType = id.split("-")[0],
                mentionObjectID = id.split("-")[1];

            // dummy entitlement service -- object isn't created yet
            var entitlementService = new jive.rte.EntitlementService({
                objectID: 0,
                objectType: 0,
                entitlement: "VIEW"
            });

            var validUserIDs = $j('#jive-modal-direct-messaging div.j-result-list li').map(function() {
                return $j(this).data('user-id') + '';
            }).get();

            if (entitlementService && mentionObjectType) {
                entitlementService.checkEntitlement(mentionObjectType, mentionObjectID, validUserIDs).addCallback(function(entitled) {
                    if (!entitled) {
                        var warning_message = '';
                        if (mentionObjectType == 3) {
                            warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.no_notification'});
                        }
                        else if (mentionObjectType == 700) {
                            warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.secret_group'});
                        }
                        else {
                            warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.restricted_content'});
                        }
                        $j('<p>'+name+' '+warning_message+'</p>').message({style: 'warn'});
                    }
                });
            }

        }
    };
});
