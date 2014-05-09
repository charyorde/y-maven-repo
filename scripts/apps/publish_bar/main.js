/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('PublishBar');  // Creates the jive.PublishBar namespace if it does not already exist.

/**
 * Entry point for the PublishBar App.
 *
 * @param options the parameter containing options for this instance
 * @param options.objectType = options.objectType the type of content being created
 * @param options.followerCount = the number of people following the current user
 * @param options.commentStatusValues = the map of comment status values from Comment Manager
 * @param options.initData = any initial data needed to populate an existing state of the publish bar
 *
 * @depends path=/resources/scripts/apps/filters/controllers/tag_autocomplete.js
 * @depends path=/resources/scripts/apps/userpicker/main.js
 * @depends path=/resources/scripts/publishbar-tagsets.js
 * @depends path=/resources/scripts/apps/publish_bar/place_main.js
 * @depends path=/resources/scripts/apps/publish_bar/models/publish_bar_source.js
 * @depends path=/resources/scripts/jive/acclaim.js
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends template=jive.publishbar.userWithoutPermission scope=client
 * @depends template=jive.publishbar.listWithoutPermission scope=client
 * @depends template=jive.publishbar.visibility scope=client
 * @depends template=jive.publishbar.placeView scope=client
 * @depends template=jive.publishbar.organize scope=client
 * @depends template=jive.publishbar.collaborationOptions scope=client
 * @depends template=jive.publishbar.userWithoutPermission scope=client
 * @depends template=jive.publishbar.listWithoutPermission scope=client
 * @depends template=jive.publishbar.guestInvited scope=client
 */
jive.PublishBar.Main = jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var main = this;

        this.objectID = options.objectDescriptor ? options.objectDescriptor.id : -1;
        this.objectType = options.objectType || -1;
        var initData = options.initData || {};

        this.publishBarSource = new jive.PublishBar.PublishBarSource();

        this.placeViewContainer = $j('#js-publishbar-place-selection');
        this.organizeContainer = $j('#js-publishbar-organize');
        this.collaborationContainer = $j('#js-publishbar-collaboration');
        this.loadingContainer = $j('#js-publishbar-loading');

        // keep state for use during state transitions
        this.visibility = initData.visibilityBean.visibility;
        this.invitationsEnabled = initData.visibilityBean.systemInvitationsEnabled;
        if (this.visibility == 'place' && initData.visibilityBean.placeSelected) {
            this.containerID = initData.visibilityBean.placeItemBean.id;
            this.containerType = initData.visibilityBean.placeItemBean.type;
            this.originalContainer = {containerID: this.containerID, containerType: this.containerType};
        }

        // change listener for select box - visibility option
        $j('#js-publishbar-select :radio').change(function() {
            main.setVisibility($j(this).val());
        });

        // initialize
        if (initData.visibilityBean.placeSelected) {
            this.initPlaceSelectedJavascript(initData);
        } else {
            this.initVisibilityJavascript(initData);
        }

        // show a spinner when getting followers
        this.spinner = null;
        jive.acclaim.addListener('beforeFetch', protect.setSpinnerVisibility.bind(this, 'show'));
        jive.acclaim.addListener('afterFetch', protect.setSpinnerVisibility.bind(this, 'hide'));
    };

    /**
     * @param {string} visibility show|hide
     */
    protect.setSpinnerVisibility = function(visibility) {
        var $container = $j('#js-publishbar-changePlace').closest('.j-js-place-view-info').find('.j-js-publish-bar-acclaim-container'),
            options    = {
                inline    : true,
                showLabel : false,
                size      : 'small'
            };
        $container.css('position', 'relative');

        if (visibility === 'show' && !this.spinner) {
            this.spinner = new jive.loader.LoaderView(options);
            this.spinner.prependTo($container);
        } else if (visibility === 'hide' && this.spinner) {
            this.spinner.destroy();
            this.spinner = null;

            $container.find('.j-loading-container').remove();
        }
    };

    protect.setVisibility = function(visibility) {
        var main = this;

        // keep previous place selection if the user is returning from another visibility setting
        var prevVisibility = main.visibility;
        main.visibility = visibility;
        if (prevVisibility != 'place' && visibility == 'place' && typeof(main.containerID) != 'undefined') {
            return main.selectPlace(main.containerType, main.containerID);
        }

        // show loading spinner
        var spinner =  new jive.loader.LoaderView({showLabel: false, size: 'small'});
        spinner.appendTo(this.loadingContainer);

        var endpoint = (main.objectType < 0 || main.objectID < 0) ? 'view' : 'edit';
        this.publishBarSource.get(endpoint, {
            objectType: main.objectType,
            objectID: main.objectID,
            visibility: visibility
        }).addCallback(function(data) {
            spinner.getContent().remove();
            spinner.destroy();

            main.renderVisibilityContainer(data.visibilityBean);
            main.renderOrganizeContainer(data.organizeBean);
            main.renderCollaborationContainer(data.optionsBean);

            // initialize javascript
            main.initVisibilityJavascript(data);
        });
    };

    protect.selectPlace = function(containerType, containerID) {
        var main = this;

        // show loading spinner
        var spinner =  new jive.loader.LoaderView({showLabel: false, size: 'small'});
        spinner.appendTo(this.loadingContainer);

        var endpoint = (main.objectType < 0 || main.objectID < 0) ? 'view' : 'edit';
        this.publishBarSource.get(endpoint, {
            objectType: this.objectType,
            objectID: this.objectID,
            visibility: 'place',
            containerType: containerType,
            containerID: containerID
        }).addCallback(function(data) {
            // keep state for use during state transitions (unless it's the root community)
            if (containerType != 14 || containerID != 1) {
                main.containerType = containerType;
                main.containerID = containerID;
            }

            spinner.getContent().remove();
            spinner.destroy();

            main.renderPlaceViewContainer(data.visibilityBean.placeItemBean);
            main.renderOrganizeContainer(data.organizeBean);
            main.renderCollaborationContainer(data.optionsBean);

            // initialize javascript
            main.initPlaceSelectedJavascript(data);
        });
    };

    protect.renderVisibilityContainer = function(visibilityBean) {
        this.placeViewContainer.hide().empty();
        $j('ul#js-publishbar-select li div.j-share-to-option').hide().empty();

        if (visibilityBean.showVisibility) {
            $j('#js-publishbar-option-' + visibilityBean.visibility).empty().append(
                $j(jive.publishbar.visibility($j.extend({
                    communityFeatureVisible: jive.global.communityFeatureVisible
                }, visibilityBean)))
            ).show();
        }
    };

    protect.renderPlaceViewContainer = function(placeItemBean) {
        $j('ul#js-publishbar-select li div.j-share-to-option').hide().empty();
        this.placeViewContainer.empty().append($j(jive.publishbar.placeView(placeItemBean))).show();
    };

    protect.renderOrganizeContainer = function(organizeBean) {
        var orig = this.organizeContainer.clone();
        this.organizeContainer.empty().append($j(jive.publishbar.organize(organizeBean)));
        this.transposeInputs(orig, this.organizeContainer);
    };

    protect.renderCollaborationContainer = function(optionsBean) {
        if (optionsBean.showOptionsLink) {
            var orig = this.collaborationContainer.clone();
            this.collaborationContainer.empty().append($j(jive.publishbar.collaborationOptions(optionsBean))).show();
            this.transposeInputs(orig, this.collaborationContainer);
        } else {
            this.collaborationContainer.empty().hide();
        }
    };

    protect.transposeInputs = function(origElem, newElem) {
        var that = this;
        $j(origElem).find('input').each(function() {
            var origInput = $j(this);
            $j(newElem).find("input#" + origInput.attr('id')).each(function() {
                var newInput = $j(this);
                if (origInput.attr('type') == 'radio') {
                    // No good way to consistently transpose these
                } else {
                    that.transposeNonRadioInput(origInput, newInput);
                }
            });
        });
    }

    protect.transposeNonRadioInput = function(origInput, newInput) {
        if (newInput.prop('disabled')) {
            // Skip disabled inputs
        }

        var inputType = newInput.attr('type');
        if (inputType == 'checkbox') {
            // skip the boxes that hae more inputs since the state won't make sense when checked
            if (!newInput || $j(newInput).closest("li").find("input").length > 1) {
                // skip checkboxes with stuff under them.  TODO - handle these cases better
                return;
            }
            newInput.prop('checked', origInput.prop('checked'));
        } else {
            newInput.val(origInput.val())
        }
    }

    // primary javascript function called when visibility changes
    protect.initVisibilityJavascript = function(data) {
        var main = this;
        if (data.visibilityBean.privateVisibility) {
            this.initPrivateVisibilityJavascript(data.optionsBean);
        } else {
            this.destroyPrivateVisibilityJavascript();
        }

        if (data.visibilityBean.placeVisibility) {
            this.initPlaceVisibilityJavascript();
        } else if (data.visibilityBean.peopleVisibility) {
            this.initPeopleVisibilityJavascript(data.visibilityBean.users);
        } else if (data.visibilityBean.allVisibility) {
            if (data.visibilityBean.personalBlog) {
                this.initAllVisibilityJavascript();
            }
        }

        this.initTagJavascript(-1,-1);
        this.initOptionsJavascript(data.optionsBean);
        
        this.manageModerationWarning(data);

        jive.localexchange.emit('initVisibilityJs', data);
    };

    // primary javascript function called when a place is selected
    protect.initPlaceSelectedJavascript = function(data) {
        var main = this;

        $j('#js-publishbar-changePlace').click(function(e) {
            main.setVisibility('place');
            e.preventDefault();

        });

        this.initTagJavascript(data.visibilityBean.placeItemBean.type, data.visibilityBean.placeItemBean.id);
        this.initOptionsJavascript(data.optionsBean);
        
        this.manageModerationWarning(data);

        jive.localexchange.emit('initPlaceSelectedJs', data);
    };

    protect.initPlaceVisibilityJavascript = function() {
        var main = this;
        this.jivePublishBarPlace = new jive.PublishBar.PlaceMain({
            objectType: this.objectType
        });

        this.jivePublishBarPlace.addListener('selectPlace', function(containerType, containerID) {
            main.selectPlace(containerType, containerID);
        });

        $j('#js-publishbar-option-place').find('#js-publishbar-place-input').prop('required', 'required');
    };

    protect.initPeopleVisibilityJavascript = function(initUsers) {
        initUsers = initUsers ? initUsers : [];
        this.peopleAutocomplete = new jive.UserPicker.Main({
            multiple: true,
            valueIsUsername: true,
            emailAllowed: this.invitationsEnabled,
            listAllowed: true,
            canInvitePartners: true,
            $input : $j("#js-publishbar-users"),
            startingUsers: { users : initUsers, userlists : [] },
            selectionCallbacks: [this.decorateGuestUsers],
            userMessages: [this.getUserInviteMessage()]
        });

        $j('#js-visibility-people').find("input[name='publishBar.users']").prop('required', 'required');
    };

    protect.initAllVisibilityJavascript = function() {
        $j('#js-publishbar-createblog-change').click(function(e) {
            $j('#js-publishbar-createblog-default').hide();
            $j('#js-publishbar-createblog').show();
            e.preventDefault();
        });
        // Prevent form submission when using enter key in this field
        $j('#js-publishbar-createblog').keypress(function(event){
            if (event.keyCode == 10 || event.keyCode == 13) {
                event.preventDefault();
            }
        });
    };

    protect.initPrivateVisibilityJavascript = function(optionsBean) {

        if (optionsBean.authorsBean) {
            $j('#js-publishbar-option-private').append('<input type="hidden" id="private-default-authorPolicy" name="publishBar.authorPolicy" ' +
                'value="' + optionsBean.authorsBean.authorPolicySingleValue + '"/>');
        }
    };

    protect.destroyPrivateVisibilityJavascript = function() {
        $j('#js-publishbar-option-private').remove('#private-default-authorPolicy');
    };

    protect.initTagJavascript = function(containerType, containerID) {
        var main = this;
        // setup tag set functions
        this.publishBarTagSetSupport = new PublishBarTagSetSupport($j('#js-publishbar-tag-input'));

        // setup tag autocomplete / suggest
        this.tagAutocomplete = new jive.Filters.TagAutocomplete($j('#js-publishbar-tag-input'), {
            containerType: containerType,
            containerID: containerID
        }).addListener('change', function() {
            main.publishBarTagSetSupport.suggestCategories();
        });
    };

    protect.initOptionsJavascript = function(optionsBean) {
        if (optionsBean.showOptionsLink) {
            this.initCollaborationToggleJavascript();
        }
        if (optionsBean.showAuthors) {
            this.initDocumentAuthorsJavascript(optionsBean.authorsBean);
        }
        if (optionsBean.showApprovers) {
            this.initDocumentApproversJavascript(optionsBean.approversBean.approvers);
        }
        if (optionsBean.showCommentOptions) {
            this.initCommentOptionsJavascript(optionsBean.commentOptionsBean);
        }
        if (optionsBean.showBlogPostPublishDate) {
            this.initBlogPostPublishDateJavascript(optionsBean.blogPostPublishDateBean);
        }
        if (optionsBean.showPollOptions) {
            this.initPollOptionsJavascript();
        }
    };

    protect.initDocumentAuthorsJavascript = function(authorsBean) {
        var initAuthors = authorsBean.authors || [];

        var viewersNotAuthors = [];

        // figure out which viewers are not already authors
        if (this.peopleAutocomplete && this.peopleAutocomplete.getSelectedUsersAndLists()) {
            var initViewers = this.peopleAutocomplete.getSelectedUsersAndLists().users || [];
            viewersNotAuthors = $j.map(initViewers, function(viewer) {
                var foundViewerAuthor = false;

                $j.each(initAuthors, function(index, author) {
                    if ((viewer.id == -1 && jive.util.equalsIgnoreCaseAndPadding(viewer.email, viewer.email)) ||
                        (viewer.id == author.id && viewer.objectType == author.objectType)) {
                        foundViewerAuthor = true;
                        return true;
                    }
                });

                if (foundViewerAuthor) {
                    return null;
                }

                // be sure to manipulate a clone so we don't inadvertently impact the viewer list
                var clonedViewer = $j.extend(true, {}, viewer);
                clonedViewer.excluded=true;
                return clonedViewer;
            });
        }


        // now merge the viewers who aren't authors with the initial set of authors
        $j.merge(initAuthors, viewersNotAuthors);

        var main = this;
        var authorOpts = {
            multiple: true,
            valueIsUsername: true,
            emailAllowed: main.invitationsEnabled,
            listAllowed: true,
            $input : $j("#js-publishbar-docAuthors"),
            startingUsers: { users : initAuthors, userlists : [] }
        };
        var entitlementCheckObject = main.getEntitlementCheckObject();
        if (entitlementCheckObject) {
            authorOpts = $j.extend(authorOpts, {
                object:entitlementCheckObject,
                entitlement:main.getAuthorEntitlementCheckMask(),
                userMessages:[main.getUserPermissionsMessage()],
                listMessages:[main.getListPermissionsMessage()]
            });
        }
        this.docAuthorAutocomplete = new jive.UserPicker.Main(authorOpts);
        if (authorsBean.forceAuthorList) {
            this.docAuthorAutocomplete.setNoPicker(true);
            this.peopleAutocomplete.addListener("selectedUsersChanged", function(data) {
                if (data.changes && data.changes.added) {
                    $j('#js-publishbar-docAuthorPolicy-' + authorsBean.authorPolicyMultipleValue).prop('checked', true).change();

                    var currentDocAuthors = main.docAuthorAutocomplete.getSelectedUsersAndLists(true),
                        docAuthorUsers = currentDocAuthors.users,
                        docAuthorUserlists = currentDocAuthors.userlists;

                    if (data.changes.added.users) {
                        // We have a new list
                        docAuthorUserlists.push(data.changes.added);
                        main.docAuthorAutocomplete.setLists(docAuthorUserlists);
                    }
                    else {
                        docAuthorUsers.push(data.changes.added);
                        main.docAuthorAutocomplete.setUsers(docAuthorUsers)
                    }
                }
            });
        }


        if (!authorsBean.defaultAuthorPolicySelected || authorsBean.forceAuthorList) {
            $j('#js-publishbar-docAuthorDetails').show();
        } else {
            $j('#js-publishbar-docAuthorDetails').hide();
        }

        $j('#js-publishbar-docDefaultAuthorshipPolicy').val(authorsBean.defaultAuthorPolicy);

        $j('#js-publishbar-docAuthorsOption').click(function(){
            if ($j(this).is(':checked')) {
                $j('#js-publishbar-docAuthorDetails').show();

                if ($j('#js-publishbar-docAuthorDetails li:visible input[id="js-publishbar-docAuthorPolicy-' + authorsBean.defaultAuthorPolicy +'"]').length == 1) {

                    $j('#js-publishbar-docAuthorPolicy-' + authorsBean.defaultAuthorPolicy).prop('checked', true);
                } else {
                    // check the first visible
                    $j($j('#js-publishbar-docAuthorDetails li:visible input[name="publishBar.authorPolicy"]')[0]).prop('checked',true);
                }

                if (authorsBean.forceAuthorList) {
                    $j('#js-publishbar-docAuthors-multiple').show();
                }


            } else {
                $j('#js-publishbar-docAuthorDetails').hide();
                // restore default
                $j('#js-publishbar-docAuthorPolicy-' + authorsBean.defaultAuthorPolicy).prop('checked', true);
                $j('#js-publishbar-docAuthors-multiple').hide();
            }
        });

        $j('#js-publishbar-docAuthorDetails input[name="publishBar.authorPolicy"]').change(function(){
            if ($j(this).is(':checked') && $j(this).val() == authorsBean.authorPolicyMultipleValue) {
                $j('#js-publishbar-docAuthors-multiple').show();
            } else {
                $j('#js-publishbar-docAuthors-multiple').hide();
            }
        });
    };

    protect.initDocumentApproversJavascript = function(initApprovers) {
        var main = this;
        initApprovers = initApprovers ? initApprovers : [];
        var approverOpts = {
            multiple: true,
            valueIsUsername: true,
            listAllowed: true,
            $input : $j("#js-publishbar-docApprovers"),
            startingUsers: { users : initApprovers, userlists : [] }
        };
        var entitlementCheckObj = main.getEntitlementCheckObject();
        if (entitlementCheckObj) {
            approverOpts = $j.extend(approverOpts, {
                object:entitlementCheckObj,
                entitlement:main.getApproverEntitlementCheckMask(),
                userMessages:[main.getUserPermissionsMessage()],
                listMessages:[main.getListPermissionsMessage()]
            });
        }
        window.docApproversAutocomplete = new jive.UserPicker.Main(approverOpts);

        //TODO: approvers does not round trip.
        $j('#js-publishbar-docApproversOption').click(function(){
            if ($j(this).is(':checked')) {
                $j('#js-publishbar-docApproversDetails').show();
                $j('#js-publishbar-docApproversDetails').find("input[name='publishBar.approvers']").prop('required', 'required');
            } else {
                $j('#js-publishbar-docApproversDetails').hide();
                $j('#js-publishbar-docApproversDetails').find("input[name='publishBar.approvers']").removeProp('required');
            }
        });
    };

    protect.initCommentOptionsJavascript = function(commentOptionsBean) {
        $j('#js-publishbar-commentOption').click(function(){
            if ($j(this).is(':checked')) {
                if (commentOptionsBean.showAdditionalCommentOptions) {
                    $j('#js-publishbar-commentOptionDetails').show();
                }
                $j('#js-publishbar-commentStatusNone').prop('checked', true);
            } else {
                $j('#js-publishbar-commentOptionDetails').hide();
                $j('#js-publishbar-commentStatusOpen').prop('checked', true);
            }
        });
    };

    protect.initBlogPostPublishDateJavascript = function(blogPostPublishDateBean) {
        if (blogPostPublishDateBean.selectedDate) {
            $j("#publishDate").attr("value", blogPostPublishDateBean.selectedDate);
        } else {
            $j("#publishDate").attr("value", blogPostPublishDateBean.defaultDate);
        }

        $j('#js-publishbar-blogPublishOption').click(function(){
            if ($j(this).is(':checked')) {
                $j('#js-publishbar-blogPublishDetails').show();
            } else {
                $j('#js-publishbar-blogPublishDetails').hide();
            }
        });
    };

    protect.initPollOptionsJavascript = function() {
        $j('#js-publishbar-pollVoteOptions').click(function(){
            if ($j(this).is(':checked')) {
                $j('#js-publishbar-pollVoteDetails').show();
            } else {
                $j('#js-publishbar-pollVoteDetails').hide();
            }
        });

        // start dates
        $j('#js-publishbar-pollVoteDetails').find("input[name='activeMode']").change(function() {
            if ($j('#active-later').is(':checked') ) {
                $j('.activeDatePicker').show();
            } else {
                $j('.activeDatePicker').hide();
                $j('#activeDate').val('');
            }
        });

        // end dates
        $j('#js-publishbar-pollVoteDetails').find("input[name='endsMode']").change(function() {
            if ($j('#js-publishbar-pollVoteDetails').find('#ends-never').is(':checked')) {
                $j('#js-publishbar-pollVoteDetails').find('.expiresDatePicker').hide();
                $j('#js-publishbar-pollVoteDetails').find('#endsDays').val('');
                $j('#js-publishbar-pollVoteDetails').find('#endsDate').val('');
            }
            else if ($j('#js-publishbar-pollVoteDetails').find('#ends-relative').is(':checked')) {
                $j('#js-publishbar-pollVoteDetails').find('.expiresDatePicker').hide();
                $j('#js-publishbar-pollVoteDetails').find('#endsDate').val('');
            }
            else if ($j('#js-publishbar-pollVoteDetails').find('#ends-later').is(':checked')) {
                $j('#js-publishbar-pollVoteDetails').find('#endsDays').val('');
                $j('#js-publishbar-pollVoteDetails').find('.expiresDatePicker').show();
            }
            else if ($j('#js-publishbar-pollVoteDetails').find('#ends-now').is(':checked')){
                $j('#js-publishbar-pollVoteDetails').find('.expiresDatePicker').hide();
                $j('#js-publishbar-pollVoteDetails').find('#endsDays').val('');
                $j('#js-publishbar-pollVoteDetails').find('#endsDate').val('');
            }
        });
    };

    protect.initCollaborationToggleJavascript = function() {
        $j('#js-publishbar-collab-link').click(function(e) {
            $j(this).find('span.jive-icon-med').toggleClass('jive-icon-arrow-right').toggleClass('jive-icon-arrow-down');
            $j('#js-publishbar-collab').slideToggle('fast');
            e.preventDefault();
        });
    };

    protect.getEntitlementCheckObject = function () {
        var main = this;
        if (main.visibility == 'place') {
            if (main.objectID > 0 && main.isPlaceUnchanged()) {
                return {objectID:main.objectID || -1, objectType:main.objectType || -1};
            }
            else {
                return {objectID:main.containerID || -1, objectType:main.containerType || -1};
            }
        }
        else {
            return null;
        }
    };

    protect.isPlaceUnchanged = function(){
        return this.originalContainer &&
            this.originalContainer.containerID == this.containerID &&
            this.originalContainer.containerType == this.containerType;
    };

    protect.getAuthorEntitlementCheckMask = function () {
       return (this.objectID > 0 && this.isPlaceUnchanged()) ? "VIEW" : "VIEW_CONTENT";
    };

    protect.getApproverEntitlementCheckMask = function () {
        return (this.objectID > 0 && this.isPlaceUnchanged()) ? "VIEW" : "VIEW_CONTENT";
    };

    protect.getUserPermissionsMessage = function () {
        return {
            type:'warn',
            render:function (user) {
                return jive.publishbar.userWithoutPermission(user);
            }
        }
    };

    protect.getListPermissionsMessage = function () {
        return {
            type:'warn',
            render:function (list) {
                return jive.publishbar.listWithoutPermission(list);
            }
        }
    };

    protect.decorateGuestUsers = function ($resultList) {
        var $targets = $resultList.find('[data-user-id="-1"]');
        $targets.append('<span class="jive-icon-sml jive-icon-info">');
    };

    protect.getUserInviteMessage = function () {
        return {
            type:'info',
            render:function (user) {
                return jive.publishbar.guestInvited({});
            }
        }
    };
    
    protect.manageModerationWarning = function (data) {
        
        var place =  data? data.visibilityBean.placeItemBean : null;
        
        // update the publish bar warning
        if (place && place.prop.isModerated) {
            $j('#js-publishbar-moderation-warning').show();                                    
        } else {
            $j('#js-publishbar-moderation-warning').hide();                
        }
        
        // notify other listeners
        jive.localexchange.emit('placeChanged',place);
    }
});
