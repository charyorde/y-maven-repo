/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('draft');

/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/form2object.js
 * @depends template=jive.content.drafts
 * @depends template=jive.content.draftlastsaved
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 */
jive.draft.View = jive.AbstractView.extend(function(protect, _super) {

    var $ = jQuery, view, timeoutId;

    this.init = function(options) {
        _super.init.call(this, options);
        this.options = $.extend({
            pushStateEnabled: true
        }, options);

        view = this;
        view.locationState = new jive.LocationState();

        $(function() {
            var content = view.getContent();

            //so for edit pages, we need a way to determine that the content has indeed changed. to do this, we need to
            //serialize the form immediately so that we have something to compare to
            var draft = view.serializeForm();
            content.data('autosave', draft);

            //if a draft exists, show the banner informing the user
            view.emit('display');

            //if the banner is shown, wire up the use draft button
            $('#autosave-prompt .use-draft').live('click', function(e) {
                var el = $(e.target).closest('.jive-draft');
                var draft = el.data('draft');

                //trigger the form population and remove the prompt
                view.emit('restore', draft);

                jive.switchboard.emit('draft.destroy', draft.id);
            });

            $('#autosave-prompt .destroy-draft').live('click', function(e) {
                var el = $(e.target).closest('.jive-draft');
                var draft = el.data('draft');

                //destroy the draft from the server and remove the prompt
                view.emit('destroy', draft.id);

                jive.switchboard.emit('draft.destroy', draft.id);
            });

            //autosave every x seconds
            view.unpause();

            //keepalive fires every x seconds
            window.setInterval(function() {
                view.emit('keepalive');
            }, options.keepaliveInterval * 1000);

            //when a user navigates away, cleanup the working draft state for the given id.
            $(window).unload(function() {

                //the draft needs to be removed from working drafts once the body is unloaded
                //autosave has to exist because we just saved it
                view.removeFromWorkingDrafts(content.data('autosave').id);

            });

            //when a draft is destroyed in another tab, make sure to reset any autosave of a form thats using that id
            jive.switchboard.addListener('draft.destroy', function(id) {
                view.destroy(id);
            });
        });
    };

    this.pause = function() {
        if(timeoutId){
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    this.unpause = function() {
        if(!timeoutId){
            timeoutId = setTimeout(view.save, view.options.interval * 1000);
        }
    };

    this.save = function() {
        var startTime = new Date().getTime();
        function runAgain(){
            var elapsed = (new Date().getTime() - startTime);
            //console.log("draft save took " + elapsed + "ms");
            //next run is between 10s and 8.333min, and we'd like to spend less then 5% of our time saving stuff.
            timeoutId = setTimeout(view.save, Math.min(Math.max(elapsed * 20, view.options.interval * 1000), view.options.interval * 50000));
        }

        var draft = view.serializeForm();

        // Short circuit this shiz if the body has no content. no savey if nothing to save
        if (draft.body.length === 0) {
            runAgain();
            return;
        }

        var content = view.getContent();

        //can never be null because its fired off on dom load
        var autosave = content.data('autosave');

        //if the subject, body, and properties haven't changed, short circuit
        //subject and body first
        var changed = draft.body != autosave.body
            || draft.subject != autosave.subject
            || JSON.stringify(draft.properties) != JSON.stringify(autosave.properties);

        //short circuit if any of the properties or the subject or body has changed
        if (!changed) {
            runAgain();
            return;
        }

        //if there was an existing autosave use it for comparison and save, otherwise a new autosave needs to be created
        if (autosave.id) {
            draft.id = autosave.id;
            view.emitP('save', draft).always(runAgain);
        } else {
            view.emitP('create', draft).always(runAgain);
        }
    };

    protect.serializeForm = function() {
        var draft = {};
        var form = view.getContent().toObject({mode: 'all'})[0];
        draft.objectType = view.options.objectType;
        draft.draftObjectType = view.options.draftObjectType;
        draft.draftObjectID = view.options.draftObjectID;
        draft.subject = $('#' + view.options.subject).val();

        //its possible for the draft instance to still be attached to a particular form, but the rte to not be available
        draft.body = view.getRTE() ? view.getRTE().getHTML() : '';

        draft.properties = {};
        $.each(view.options.properties, function(i, v) {
            draft.properties[v] = form[v];
        });

        return draft;
    };

    protect.getRTE = function () {
        return window.editor.get(view.options.editorId);
    };

    this.saved = function(draft, promise) {
        try{
            var content = view.getContent();

            //store the last autosave in the form object
            content.data('autosave', draft);

            //add draft to local storage
            view.addToWorkingDrafts(draft.id);

            //update url
            if (view.options.pushStateEnabled) {
                view.updatePushState(draft.id);
            }

            //update the draftid element in the form for any serverside processing
            view.updateFormDraftID(content, draft.id);

            //render a new last saved message
            var new_last_saved = $(jive.content.draftlastsaved({date: new Date()}));
            var $belowEditor = $(view.getRTE().getBelowEditorArea());

            var last_saved = $belowEditor.find('.last-saved');

            //if there an existing last saved message
            if (last_saved.length) {
                last_saved.replaceWith(new_last_saved);
            } else {
                //make sure its hidden, inject it after the rte, and show it
                new_last_saved.hide().appendTo($belowEditor).fadeIn();
                view.getRTE().autoReposition();
            }
            promise.emitSuccess(draft);
        }catch(ex){
            if(promise){
                promise.emitError(ex);
            }
        }
    };

    this.display = function(resp) {

        //grab the pushed state if it exists
        var pushedState = view.locationState.getState().draftID;
        if (pushedState) {
            var found = false;

            //for each draft id available, if it matches the id in the pushed state, lets recover it without showing others
            $.each(resp, function(i, draft) {
                if (draft.id == pushedState) {

                    //restore it without displaying others
                    view.emit('restore', draft);
                    found = true;
                }
            });

            //break out of the closure so we dont render the rest of the drafts
            if (found) {
                return;
            }
        }

        //for every draft in the response, make sure its not in the working drafts, and add it to a drafts array
        var drafts = [];
        $.each(resp, function(i, draft) {
            //only add drafts to the final display that users arent working on
            if (!view.isWorkingDraft(draft.id)) {
                drafts.push(draft);
            }
        });

        //short circuit if no draft exists
        if (drafts.length === 0) {
            return;
        }

        var content = view.getContent();

        //generate the draft template, prepend it to the content container, and fade it in
        var draftTemplate = $(jive.content.drafts({drafts: drafts}));

        //for each draft, store its data in the draft html element
        draftTemplate.find('.jive-draft').each(function(index) {
            $(this).data('draft', drafts[index]);
        });

        draftTemplate.hide().insertBefore(content).fadeIn();
    };

    this.restore = function(data) {
        var content = view.getContent();

        //first, set all the generic properties.
        //ordering is a bit important here just in case the js2form lib tries to set subject or body
        js2form(content[0], data.properties);

        //then set subject and body
        view.getRTE().setHTML(data.body);
        $('#' + view.options.subject).val(data.subject);

        content.trigger('restore', data);

        //mark this as a working draft
        view.addToWorkingDrafts(data.id);

        //update the draftid element in the form for any serverside processing
        view.updateFormDraftID(content, data.id);

        content.data('autosave', data);

        //hide the all drafts block
        $('#autosave-prompt').fadeOut(function() {
            $(this).remove();
        });

        if (view.options.pushStateEnabled) {
            view.updatePushState(data.id);
        }
    };

    this.destroy = function(id) {
        //all im doing here is making sure to hide either the overall autosave prompt or just the single draft instance
        //this is responsible for making sure destroy when multiple drafts are showing only destroys the one element
        var allDrafts = $('#autosave-prompt');

        //short circuit if there is no draft prompt there
        if (allDrafts.length === 0) {
            return;
        }

        var singleDraft = $('#draft-' + id);

        //this draft id isnt present in the dom, just move along. this might happen because a switchboard event fired the destroy
        if (singleDraft.length === 0) {
            return;
        }

        var hasMoreDrafts = allDrafts.find('.jive-draft').length > 1;
        var toRemove = hasMoreDrafts ? singleDraft : allDrafts;
        toRemove.fadeOut(function() {
            $(this).remove();
        });
    };

    protect.updateFormDraftID = function(form, id) {
        var $draftID = form.find('input#draftID');

        if ($draftID.length === 0) {
            $draftID = $('<input />', {
                id: 'draftID',
                name: 'draftID',
                type: 'hidden'
            });
            $draftID.appendTo(form);
        }

        $draftID.val(id);
    };

    protect.updatePushState = function(id) {
        view.locationState.pushState({
            draftID: id
        });
    };

    protect.addToWorkingDrafts = function(id) {
        var workingDrafts = view.getWorkingDrafts();
        if (!view.isWorkingDraft(id)) {
            workingDrafts.push(id);
        }
        if (typeof(localStorage) != 'undefined') {
            localStorage.setItem('workingDrafts', workingDrafts);
        }
    };

    protect.removeFromWorkingDrafts = function(id) {
        var workingDrafts = view.getWorkingDrafts();
        workingDrafts.splice(workingDrafts.indexOf(String(id)), 1);
        if (typeof(localStorage) != 'undefined') {
            localStorage.setItem('workingDrafts', workingDrafts);
        }
    };

    protect.isWorkingDraft = function(id) {
        return $.inArray(String(id), view.getWorkingDrafts()) > -1;
    };

    protect.getWorkingDrafts = function() {

        if (typeof(localStorage) == 'undefined') {
            return [];
        }

        var workingDraftsString = localStorage.getItem('workingDrafts');
        return workingDraftsString ? workingDraftsString.split(',') : [];
    };
});
